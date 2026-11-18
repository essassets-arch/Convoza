import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InboxGateway } from '../inbox/inbox.gateway';
import { AutomationsService } from '../automations/automations.service';
import { BillingService } from '../billing/billing.service';
import {
  MessageStatus,
  MessageDirection,
  MessageType,
  AutomationTrigger,
  ConversationStatus,
} from '@convoza/shared-types';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inboxGateway: InboxGateway,
    private readonly automationsService: AutomationsService,
    private readonly billingService: BillingService
  ) {}

  async processRazorpayWebhook(payload: any) {
    const event = payload?.event || '';
    this.logger.log(`Razorpay webhook received: ${event}`);
    return { received: true };
  }

  /**
   * Handle incoming Meta WhatsApp Cloud API Webhook payload
   */
  async processMetaWebhook(payload: any) {
    if (!payload || payload.object !== 'whatsapp_business_account') {
      return { received: true };
    }

    const entries = payload.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const val = change.value;
        if (!val) continue;

        // 1. Process Message Status Updates (sent, delivered, read, failed + Meta pricing)
        if (val.statuses && Array.isArray(val.statuses)) {
          for (const statusObj of val.statuses) {
            await this.handleStatusEvent(statusObj);
          }
        }

        // 2. Process Incoming Messages
        if (val.messages && Array.isArray(val.messages)) {
          const metadata = val.metadata;
          for (const messageObj of val.messages) {
            await this.handleIncomingMessage(metadata, messageObj, val.contacts);
          }
        }

        // 2b. Process WhatsApp Business App Coexistence Echoes (smb_message_echoes)
        if (val.message_echoes && Array.isArray(val.message_echoes)) {
          const metadata = val.metadata;
          for (const echoObj of val.message_echoes) {
            await this.handleMessageEcho(metadata, echoObj);
          }
        }

        // 3. Process Template Status Updates
        if (change.field === 'message_template_status_update' && val.message_template_id) {
          await this.handleTemplateStatusUpdate(
            String(val.message_template_id),
            val.event,
            val.reason
          );
        }

        // 4. Process WABA Account Updates (Embedded Signup / Quality / Tier)
        if (change.field === 'account_update') {
          this.logger.log(
            `Meta Tech Provider account_update event received: event=${val.event || 'UNKNOWN'}, waba=${val.waba_info?.waba_id || entry.id}`
          );
        }
      }
    }

    return { success: true };
  }

  private async handleStatusEvent(statusObj: any) {
    const wamid = statusObj.id;
    if (!wamid) return;
    const statusStr = statusObj.status?.toUpperCase();

    let newStatus = MessageStatus.SENT;
    if (statusStr === 'DELIVERED') newStatus = MessageStatus.DELIVERED;
    if (statusStr === 'READ') newStatus = MessageStatus.READ;
    if (statusStr === 'FAILED') newStatus = MessageStatus.FAILED;

    const message = await this.prisma.message.findUnique({
      where: { wamid },
    });

    if (!message) {
      this.logger.debug(`Status received for unknown message wamid: ${wamid}`);
      return;
    }

    const timestamp = statusObj.timestamp
      ? new Date(Number(statusObj.timestamp) * 1000)
      : new Date();

    const updateData: any = {
      status: newStatus,
    };

    if (newStatus === MessageStatus.DELIVERED) updateData.deliveredAt = timestamp;
    if (newStatus === MessageStatus.READ) updateData.readAt = timestamp;
    if (newStatus === MessageStatus.FAILED && statusObj.errors) {
      updateData.errorMessage = statusObj.errors[0]?.message || 'Delivery failed';
      updateData.errorCode = String(statusObj.errors[0]?.code || '');
    }

    // Reconcile exact Meta Wholesale Cost from Meta's webhook pricing object
    if (statusObj.pricing) {
      const rawCat = String(statusObj.pricing.category || '').toUpperCase();
      const mappedCat: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE' =
        rawCat === 'MARKETING'
          ? 'MARKETING'
          : rawCat === 'AUTHENTICATION'
          ? 'AUTHENTICATION'
          : rawCat === 'UTILITY'
          ? 'UTILITY'
          : 'SERVICE';
      const billable = Boolean(statusObj.pricing.billable);
      const rates = await this.billingService.getRateCard(message.organizationId);
      updateData.billingCategory = mappedCat;
      updateData.isBillable = billable;
      updateData.metaCostPaise = billable ? rates.metaWholesalePaise[mappedCat] ?? 0 : 0;
    }

    await this.prisma.message.update({
      where: { id: message.id },
      data: updateData,
    });

    // Auto-refund tenant prepaid wallet if Meta reports FAILED
    if (newStatus === MessageStatus.FAILED) {
      await this.billingService.refundFailedMessageIfCharged(message.id);
    }

    await this.prisma.messageStatusEvent.create({
      data: {
        messageId: message.id,
        status: newStatus,
        timestamp,
        rawPayload: statusObj,
      },
    });

    this.inboxGateway.broadcastMessageStatus(message.organizationId, {
      messageId: message.id,
      conversationId: message.conversationId,
      status: newStatus,
      timestamp: timestamp.toISOString(),
    });
  }

  private async handleIncomingMessage(metadata: any, messageObj: any, contactsArr?: any[]) {
    const phoneNumberId = metadata?.phone_number_id;
    if (!phoneNumberId) return;

    // Idempotency guard against Meta webhook retries
    if (messageObj?.id) {
      const duplicate = await this.prisma.message.findUnique({
        where: { wamid: messageObj.id },
        select: { id: true },
      });
      if (duplicate) return;
    }

    const phoneRecord = await this.prisma.phoneNumber.findUnique({
      where: { phoneNumberId },
      include: { organization: { select: { id: true, isSuspended: true } } },
    });

    if (!phoneRecord) {
      this.logger.warn(`Incoming message for unregistered phone number ID: ${phoneNumberId}`);
      return;
    }

    if (phoneRecord.organization?.isSuspended) {
      this.logger.warn(`Dropping inbound webhook for suspended organization: ${phoneRecord.organizationId}`);
      return;
    }

    const orgId = phoneRecord.organizationId;
    const senderPhone = '+' + String(messageObj.from || '').replace(/[^\d]/g, '');
    const contactProfileName = contactsArr?.[0]?.profile?.name || '';

    const existingContact = await this.prisma.contact.findUnique({
      where: {
        organizationId_phone: {
          organizationId: orgId,
          phone: senderPhone,
        },
      },
    });

    const isNewContact = !existingContact;
    const contact = existingContact
      ? await this.prisma.contact.update({
          where: { id: existingContact.id },
          data: { ...(contactProfileName && !existingContact.name ? { name: contactProfileName } : {}) },
        })
      : await this.prisma.contact.create({
          data: {
            organizationId: orgId,
            phone: senderPhone,
            name: contactProfileName || undefined,
            consentStatus: 'OPTED_IN',
            consentSource: 'WHATSAPP_INBOUND',
          },
        });

    const windowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let body = '';
    let msgType = MessageType.TEXT;
    let mediaUrl: string | undefined;

    if (messageObj.type === 'text') {
      body = messageObj.text?.body || '';
      msgType = MessageType.TEXT;
    } else if (messageObj.type === 'button') {
      body = messageObj.button?.text || '';
      msgType = MessageType.INTERACTIVE;
    } else if (messageObj.type === 'interactive') {
      body = messageObj.interactive?.button_reply?.title || messageObj.interactive?.list_reply?.title || '';
      msgType = MessageType.INTERACTIVE;
    } else if (['image', 'video', 'document', 'audio'].includes(messageObj.type)) {
      body = messageObj[messageObj.type]?.caption || `[${messageObj.type.toUpperCase()}]`;
      msgType = messageObj.type.toUpperCase() as MessageType;
      mediaUrl = messageObj[messageObj.type]?.id;
    }

    // Auto opt-out compliance when customer texts STOP / UNSUBSCRIBE
    const upperTrim = body.trim().toUpperCase();
    if (upperTrim === 'STOP' || upperTrim === 'UNSUBSCRIBE') {
      await this.prisma.contact.update({
        where: { id: contact.id },
        data: { consentStatus: 'OPTED_OUT' },
      });
    }

    const conversation = await this.prisma.conversation.upsert({
      where: {
        organizationId_phoneNumberId_contactId: {
          organizationId: orgId,
          phoneNumberId,
          contactId: contact.id,
        },
      },
      create: {
        organizationId: orgId,
        phoneNumberId,
        contactId: contact.id,
        status: ConversationStatus.OPEN,
        unreadCount: 1,
        lastMessageAt: new Date(),
        lastMessagePreview: body,
        customerWindowExpiresAt: windowExpiresAt,
      },
      update: {
        status: ConversationStatus.OPEN,
        unreadCount: { increment: 1 },
        lastMessageAt: new Date(),
        lastMessagePreview: body,
        customerWindowExpiresAt: windowExpiresAt,
      },
    });

    const message = await this.prisma.message.create({
      data: {
        organizationId: orgId,
        phoneNumberId,
        contactId: contact.id,
        conversationId: conversation.id,
        direction: MessageDirection.INBOUND,
        type: msgType,
        status: MessageStatus.DELIVERED,
        wamid: messageObj.id,
        body,
        mediaUrl,
        billingCategory: 'SERVICE',
        isBillable: false,
        metaCostPaise: 0,
        chargedPaise: 0,
        deliveredAt: new Date(),
      },
    });

    this.inboxGateway.broadcastNewMessage(orgId, {
      ...message,
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
      },
    });

    this.inboxGateway.broadcastConversationUpdate(orgId, {
      ...conversation,
      isWindowActive: true,
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
      },
    });

    const autoCtx = {
      contactId: contact.id,
      contactPhone: contact.phone,
      conversationId: conversation.id,
      phoneNumberId,
      messageText: body,
    };

    if (isNewContact) {
      this.automationsService
        .evaluateRules(orgId, AutomationTrigger.NEW_CONTACT, autoCtx)
        .catch((err) => this.logger.error(`NEW_CONTACT automation failed: ${err.message}`));
    }

    this.automationsService
      .evaluateRules(orgId, AutomationTrigger.INCOMING_MESSAGE, autoCtx)
      .catch((err) => this.logger.error(`INCOMING_MESSAGE automation failed: ${err.message}`));

    this.automationsService
      .evaluateRules(orgId, AutomationTrigger.KEYWORD_DETECTED, autoCtx)
      .catch((err) => this.logger.error(`KEYWORD_DETECTED automation failed: ${err.message}`));
  }

  private async handleTemplateStatusUpdate(metaTemplateId: string, event?: string, reason?: string) {
    const statusUpper = (event || '').toUpperCase();
    let mappedStatus: 'APPROVED' | 'REJECTED' | 'PAUSED' | 'DISABLED' | 'PENDING' = 'PENDING';
    if (statusUpper === 'APPROVED') mappedStatus = 'APPROVED';
    else if (statusUpper === 'REJECTED') mappedStatus = 'REJECTED';
    else if (statusUpper === 'PAUSED') mappedStatus = 'PAUSED';
    else if (statusUpper === 'DISABLED') mappedStatus = 'DISABLED';

    await this.prisma.template.updateMany({
      where: { metaTemplateId },
      data: {
        status: mappedStatus,
        rejectionReason: reason && reason !== 'NONE' ? reason : null,
      },
    });
    this.logger.log(`Template ${metaTemplateId} status updated via Meta webhook -> ${mappedStatus}`);
  }

  private async handleMessageEcho(metadata: any, echoObj: any) {
    const phoneNumberId = metadata?.phone_number_id;
    if (!phoneNumberId || !echoObj?.to) return;

    const phoneRecord = await this.prisma.phoneNumber.findUnique({
      where: { phoneNumberId },
      include: { organization: { select: { isSuspended: true } } },
    });
    if (!phoneRecord || phoneRecord.organization?.isSuspended) return;

    const orgId = phoneRecord.organizationId;
    const recipientPhone = '+' + String(echoObj.to).replace(/[^\d]/g, '');
    const body = echoObj.text?.body || `[${(echoObj.type || 'MEDIA').toUpperCase()}]`;

    const contact = await this.prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId: orgId,
          phone: recipientPhone,
        },
      },
      create: {
        organizationId: orgId,
        phone: recipientPhone,
        consentStatus: 'OPTED_IN',
        consentSource: 'WHATSAPP_INBOUND',
      },
      update: {},
    });

    const conversation = await this.prisma.conversation.upsert({
      where: {
        organizationId_phoneNumberId_contactId: {
          organizationId: orgId,
          phoneNumberId,
          contactId: contact.id,
        },
      },
      create: {
        organizationId: orgId,
        phoneNumberId,
        contactId: contact.id,
        status: ConversationStatus.OPEN,
        lastMessageAt: new Date(),
        lastMessagePreview: body,
      },
      update: {
        lastMessageAt: new Date(),
        lastMessagePreview: body,
      },
    });

    if (echoObj.id) {
      const exists = await this.prisma.message.findUnique({ where: { wamid: echoObj.id } });
      if (exists) return;
    }

    const message = await this.prisma.message.create({
      data: {
        organizationId: orgId,
        phoneNumberId,
        contactId: contact.id,
        conversationId: conversation.id,
        direction: MessageDirection.OUTBOUND,
        type: MessageType.TEXT,
        status: MessageStatus.SENT,
        wamid: echoObj.id,
        body,
        billingCategory: 'SERVICE',
        isBillable: false,
        sentAt: new Date(),
      },
    });

    this.inboxGateway.broadcastNewMessage(orgId, message);
    this.inboxGateway.broadcastConversationUpdate(orgId, {
      ...conversation,
      contact: { id: contact.id, name: contact.name, phone: contact.phone },
    });
  }
}
