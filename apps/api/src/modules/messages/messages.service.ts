import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { SendIndividualMessageDto } from './dto/message.dto';
import { normalizeE164 } from '@convoza/validation';
import { decryptSecret, META_CONFIG, buildMetaMessagePayload } from '@convoza/configuration';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
  ConsentStatus,
  TemplateStatus,
  JobType,
  JobStatus,
} from '@convoza/shared-types';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService
  ) {}

  async sendMessage(organizationId: string, dto: SendIndividualMessageDto) {
    // 1. Validate sending phone number
    const senderPhone = await this.prisma.phoneNumber.findFirst({
      where: {
        phoneNumberId: dto.phoneNumberId,
        organizationId,
      },
      include: {
        whatsappAccount: {
          include: { credentials: true },
        },
      },
    });

    if (!senderPhone || !senderPhone.whatsappAccount) {
      throw new NotFoundException('Sending WhatsApp phone number not configured for this organization');
    }

    // 2. Normalize recipient phone
    const norm = normalizeE164(dto.recipientPhone);
    if (!norm.isValid) {
      throw new BadRequestException(norm.error || 'Invalid recipient phone number');
    }
    const recipientPhone = norm.normalized;

    // 3. Find or create Contact
    let contact = await this.prisma.contact.findUnique({
      where: {
        organizationId_phone: {
          organizationId,
          phone: recipientPhone,
        },
      },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          organizationId,
          phone: recipientPhone,
          consentStatus: ConsentStatus.OPTED_IN,
        },
      });
    }

    // 4. Find or create Conversation
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        organizationId_phoneNumberId_contactId: {
          organizationId,
          phoneNumberId: senderPhone.phoneNumberId,
          contactId: contact.id,
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          organizationId,
          phoneNumberId: senderPhone.phoneNumberId,
          contactId: contact.id,
        },
      });
    }

    // 5. Enforce 24-Hour Customer Service Window
    const isWindowOpen =
      conversation.customerWindowExpiresAt &&
      new Date(conversation.customerWindowExpiresAt) > new Date();

    let template: any = null;

    if (dto.type === MessageType.TEMPLATE) {
      if (!dto.templateId) {
        throw new BadRequestException('Template ID must be specified when message type is TEMPLATE');
      }

      template = await this.prisma.template.findFirst({
        where: { id: dto.templateId, organizationId },
      });

      if (!template) {
        throw new NotFoundException('Specified template not found');
      }

      if (template.status !== TemplateStatus.APPROVED) {
        throw new BadRequestException(
          `Cannot send template in status "${template.status}". Template must be APPROVED by Meta.`
        );
      }

      // Check opt-out policy
      if (template.category === 'MARKETING' && contact.consentStatus === ConsentStatus.OPTED_OUT) {
        throw new BadRequestException('Recipient has opted out of marketing communications');
      }
    } else {
      // Free-form message: Requires active 24-hour service window
      if (!isWindowOpen) {
        throw new BadRequestException(
          'The 24-hour customer service window is closed. Meta policy mandates an approved WhatsApp Template message to re-engage.'
        );
      }
    }

    // 6. Check Idempotency Key
    if (dto.idempotencyKey) {
      const existingMsg = await this.prisma.message.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existingMsg) {
        return existingMsg;
      }
    }

    // 7. Evaluate Meta wholesale cost & debit Prepaid Wallet if org uses PREPAID_WALLET
    const msgCategory: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE' =
      dto.type === MessageType.TEMPLATE && template?.category
        ? (template.category as any)
        : 'SERVICE';

    const costEval = await this.billingService.evaluateAndDebitMessageCost(
      organizationId,
      msgCategory,
      template ? `Template (${template.name}) to ${recipientPhone}` : `Message to ${recipientPhone}`
    );

    // 8. If live Meta WABA credentials are configured, dispatch immediately via Meta Cloud API v20.0
    const encryptedToken = senderPhone.whatsappAccount.credentials?.encryptedToken;
    const decryptedToken = encryptedToken ? decryptSecret(encryptedToken) : '';
    const hasLiveMetaToken =
      Boolean(decryptedToken) &&
      !decryptedToken.includes('placeholder') &&
      !decryptedToken.includes('MetaPermanentToken');

    let liveWamid: string | undefined;

    if (hasLiveMetaToken) {
      const metaPayload = buildMetaMessagePayload({
        recipientPhone,
        type: dto.type,
        body: dto.body,
        mediaUrl: dto.mediaUrl,
        templateName: template?.name,
        templateLanguage: template?.language,
        templateCategory: template?.category,
        templateComponents: (template?.components as any[]) || [],
        templateParameters: dto.templateParameters || null,
      });

      try {
        const metaRes = await axios.post(
          `${META_CONFIG.GRAPH_API_BASE}/${senderPhone.phoneNumberId}/messages`,
          metaPayload,
          {
            headers: {
              Authorization: `Bearer ${decryptedToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 12000,
          }
        );
        liveWamid = metaRes.data?.messages?.[0]?.id;
      } catch (err: any) {
        // Refund wallet immediately if synchronous Meta call failed
        if (costEval.chargedPaise > 0) {
          await this.prisma.$transaction(async (tx) => {
            const updatedOrg = await tx.organization.update({
              where: { id: organizationId },
              data: { walletBalancePaise: { increment: costEval.chargedPaise } },
            });
            await tx.walletTransaction.create({
              data: {
                organizationId,
                type: 'CREDIT_REFUND',
                amountPaise: costEval.chargedPaise,
                balanceAfterPaise: updatedOrg.walletBalancePaise,
                description: `Auto-refund: Meta API rejected dispatch to ${recipientPhone}`,
              },
            });
          });
        }
        const metaErrMsg =
          err.response?.data?.error?.error_user_msg ||
          err.response?.data?.error?.message ||
          err.message;
        this.logger.error(`Meta Cloud API message send failed: ${metaErrMsg}`);
        throw new BadRequestException(`Meta Cloud API error: ${metaErrMsg}`);
      }
    }

    // 9. Atomic transaction: record message (+ outbox event if queued asynchronously)
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const message = await tx.message.create({
        data: {
          organizationId,
          phoneNumberId: senderPhone.phoneNumberId,
          contactId: contact!.id,
          conversationId: conversation!.id,
          direction: MessageDirection.OUTBOUND,
          type: dto.type,
          status: hasLiveMetaToken ? MessageStatus.SENT : MessageStatus.QUEUED,
          wamid: liveWamid,
          sentAt: hasLiveMetaToken ? now : undefined,
          body: dto.body || (template ? `[Template: ${template.name}]` : undefined),
          templateId: dto.templateId,
          templateParameters: (dto.templateParameters as any) || null,
          billingCategory: costEval.billingCategory,
          isBillable: costEval.isBillable,
          metaCostPaise: costEval.metaCostPaise,
          chargedPaise: costEval.chargedPaise,
          mediaUrl: dto.mediaUrl,
          mediaType: dto.mediaType,
          idempotencyKey: dto.idempotencyKey,
        },
      });

      if (hasLiveMetaToken) {
        await tx.messageStatusEvent.create({
          data: {
            messageId: message.id,
            status: MessageStatus.SENT,
            timestamp: now,
          },
        });
      } else {
        // Record outbox event for background worker processing
        await tx.outboxEvent.create({
          data: {
            organizationId,
            type: JobType.SEND_INDIVIDUAL_MESSAGE,
            payload: {
              messageId: message.id,
              phoneNumberId: senderPhone.phoneNumberId,
              recipientPhone,
              type: dto.type,
              body: dto.body,
              templateName: template?.name,
              templateLanguage: template?.language,
              templateCategory: template?.category,
              templateComponents: template?.components,
              templateParameters: dto.templateParameters,
              mediaUrl: dto.mediaUrl,
            },
            status: JobStatus.PENDING,
            idempotencyKey: dto.idempotencyKey || `msg_${message.id}`,
          },
        });
      }

      // Update conversation timestamp and preview
      await tx.conversation.update({
        where: { id: conversation!.id },
        data: {
          lastMessageAt: now,
          lastMessagePreview: dto.body || (template ? `Template: ${template.name}` : 'Media message'),
        },
      });

      return message;
    });
  }

  async getMessages(
    organizationId: string,
    query: {
      conversationId?: string;
      contactId?: string;
      status?: string;
      direction?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.conversationId) where.conversationId = query.conversationId;
    if (query.contactId) where.contactId = query.contactId;
    if (query.status) where.status = query.status as MessageStatus;
    if (query.direction) where.direction = query.direction as MessageDirection;

    const [total, items] = await Promise.all([
      this.prisma.message.count({ where }),
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, name: true, phone: true } },
          statusEvents: { orderBy: { timestamp: 'asc' } },
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMessageById(organizationId: string, id: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, organizationId },
      include: {
        contact: true,
        statusEvents: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }
}

