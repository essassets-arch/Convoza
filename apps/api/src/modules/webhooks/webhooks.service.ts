import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InboxGateway } from '../inbox/inbox.gateway';
import { AutomationsService } from '../automations/automations.service';
import {
  MessageStatus,
  MessageDirection,
  MessageType,
  JobType,
  JobStatus,
  AutomationTrigger,
  ConversationStatus,
} from '@convoza/shared-types';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inboxGateway: InboxGateway,
    private readonly automationsService: AutomationsService
  ) {}

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

        // 1. Process Message Status Updates (sent, delivered, read, failed)
        if (val.statuses && Array.isArray(val.statuses)) {
          for (const statusObj of val.statuses) {
            await this.handleStatusEvent(statusObj);
          }
        }

        // 2. Process Incoming Messages
        if (val.messages && Array.isArray(val.messages)) {
          const metadata = val.metadata; // contains phone_number_id, display_phone_number
          for (const messageObj of val.messages) {
            await this.handleIncomingMessage(metadata, messageObj, val.contacts);
          }
        }

        // 3. Process Template Approval / Status Updates from Meta
        if (change.field === 'message_template_status_update' && val.message_template_id) {
          await this.handleTemplateStatusUpdate(String(val.message_template_id), val.event, val.reason);
        }

        // 4. Process Tech Provider Embedded Signup Account Updates
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

    const updated = await this.prisma.message.update({
      where: { id: message.id },
      data: updateData,
    });

    // Record status event history
    await this.prisma.messageStatusEvent.create({
      data: {
        messageId: message.id,
        status: newStatus,
        timestamp,
        rawPayload: statusObj,
      },
    });

    // Notify real-time clients
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

    // Resolve phone number record to find organization
    const phoneRecord = await this.prisma.phoneNumber.findUnique({
      where: { phoneNumberId },
    });

    if (!phoneRecord) {
      this.logger.warn(`Incoming message for unregistered phone number ID: ${phoneNumberId}`);
      return;
    }

    const orgId = phoneRecord.organizationId;
    const senderPhone = '+' + messageObj.from.replace(/[^\d]/g, '');
    const contactProfileName = contactsArr?.[0]?.profile?.name || '';

    // Find or create Contact
    const contact = await this.prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId: orgId,
          phone: senderPhone,
        },
      },
      create: {
        organizationId: orgId,
        phone: senderPhone,
        name: contactProfileName || undefined,
        consentStatus: 'OPTED_IN',
        consentSource: 'WHATSAPP_INBOUND',
      },
      update: {
        ...(contactProfileName && { name: contactProfileName }),
      },
    });

    // 24-hour customer window resets on inbound customer message!
    const windowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Extract message body and type
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
      mediaUrl = messageObj[messageObj.type]?.id; // Meta media ID
    }

    // Find or create Conversation
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

    // Create Message record
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
        deliveredAt: new Date(),
      },
    });

    // Broadcast new message to shared inbox real-time room
    this.inboxGateway.broadcastNewMessage(orgId, {
      ...message,
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
      },
    });

    // Trigger rule-based automations asynchronously
    this.automationsService
      .evaluateRules(orgId, AutomationTrigger.INCOMING_MESSAGE, {
        contactId: contact.id,
        conversationId: conversation.id,
        phoneNumberId,
        messageText: body,
      })
      .catch((err) => this.logger.error(`Automation trigger failed: ${err.message}`));
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
}

