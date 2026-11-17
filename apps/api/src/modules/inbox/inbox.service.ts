import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { InboxGateway } from './inbox.gateway';
import { decryptSecret, META_CONFIG, buildMetaMessagePayload } from '@convoza/configuration';
import {
  AssignConversationDto,
  ResolveConversationDto,
  AddInternalNoteDto,
  InboxReplyDto,
} from './dto/inbox.dto';
import {
  ConversationStatus,
  MessageDirection,
  MessageStatus,
  MessageType,
  JobType,
  JobStatus,
  TemplateStatus,
} from '@convoza/shared-types';

@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: InboxGateway
  ) {}

  async getConversations(
    organizationId: string,
    query: {
      status?: string;
      assignedTo?: string; // 'me', 'unassigned', or userId
      unreadOnly?: boolean;
      search?: string;
      currentUserId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.status) {
      where.status = query.status as ConversationStatus;
    }

    if (query.assignedTo === 'me' && query.currentUserId) {
      where.assignedToUserId = query.currentUserId;
    } else if (query.assignedTo === 'unassigned') {
      where.assignedToUserId = null;
    } else if (query.assignedTo && query.assignedTo !== 'all') {
      where.assignedToUserId = query.assignedTo;
    }

    if (query.unreadOnly) {
      where.unreadCount = { gt: 0 };
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { contact: { name: { contains: term, mode: 'insensitive' } } },
        { contact: { phone: { contains: term } } },
        { lastMessagePreview: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.conversation.count({ where }),
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          contact: {
            include: {
              tags: { include: { tag: true } },
            },
          },
          assignedAgent: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          phoneNumber: {
            select: { id: true, displayPhoneNumber: true, verifiedName: true },
          },
        },
      }),
    ]);

    const enriched = items.map((c) => {
      const isWindowActive =
        c.customerWindowExpiresAt && new Date(c.customerWindowExpiresAt) > new Date();

      return {
        ...c,
        isWindowActive,
        contact: {
          ...c.contact,
          tags: c.contact.tags.map((t) => t.tag),
        },
      };
    });

    return {
      items: enriched,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConversationById(organizationId: string, id: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id, organizationId },
      include: {
        contact: {
          include: {
            tags: { include: { tag: true } },
            consentRecords: { take: 5, orderBy: { recordedAt: 'desc' } },
          },
        },
        assignedAgent: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        phoneNumber: {
          select: { id: true, displayPhoneNumber: true, verifiedName: true },
        },
        notes: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Reset unread count when opened
    if (conversation.unreadCount > 0) {
      await this.prisma.conversation.update({
        where: { id },
        data: { unreadCount: 0 },
      });
      conversation.unreadCount = 0;
    }

    const isWindowActive =
      conversation.customerWindowExpiresAt &&
      new Date(conversation.customerWindowExpiresAt) > new Date();

    return {
      ...conversation,
      isWindowActive,
      contact: {
        ...conversation.contact,
        tags: conversation.contact.tags.map((t) => t.tag),
      },
    };
  }

  async getConversationMessages(
    organizationId: string,
    conversationId: string,
    page = 1,
    limit = 50
  ) {
    const skip = (Math.max(1, page) - 1) * limit;

    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const [total, messages] = await Promise.all([
      this.prisma.message.count({ where: { conversationId } }),
      this.prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          statusEvents: { orderBy: { timestamp: 'asc' } },
        },
      }),
    ]);

    return {
      items: messages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async replyToConversation(
    organizationId: string,
    conversationId: string,
    userId: string,
    dto: InboxReplyDto
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
      include: {
        contact: true,
        phoneNumber: {
          include: {
            whatsappAccount: {
              include: { credentials: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isWindowActive =
      conversation.customerWindowExpiresAt &&
      new Date(conversation.customerWindowExpiresAt) > new Date();

    let template: any = null;

    if (dto.type === MessageType.TEMPLATE) {
      if (!dto.templateId) {
        throw new BadRequestException('Template ID is required when sending template message');
      }
      template = await this.prisma.template.findFirst({
        where: { id: dto.templateId, organizationId },
      });
      if (!template || template.status !== TemplateStatus.APPROVED) {
        throw new BadRequestException('Specified template must be approved by Meta');
      }
    } else {
      if (!isWindowActive) {
        throw new BadRequestException(
          '24-hour customer window is closed. Meta policy mandates an approved template message to re-engage with the customer.'
        );
      }
    }

    const encryptedToken = conversation.phoneNumber?.whatsappAccount?.credentials?.encryptedToken;
    const decryptedToken = encryptedToken ? decryptSecret(encryptedToken) : '';
    const hasLiveMetaToken =
      Boolean(decryptedToken) &&
      !decryptedToken.includes('placeholder') &&
      !decryptedToken.includes('MetaPermanentToken');

    let liveWamid: string | undefined;

    if (hasLiveMetaToken) {
      const metaPayload = buildMetaMessagePayload({
        recipientPhone: conversation.contact.phone,
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
          `${META_CONFIG.GRAPH_API_BASE}/${conversation.phoneNumberId}/messages`,
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
        const metaErrMsg =
          err.response?.data?.error?.error_user_msg ||
          err.response?.data?.error?.message ||
          err.message;
        this.logger.error(`Meta Cloud API inbox reply failed: ${metaErrMsg}`);
        throw new BadRequestException(`Meta Cloud API error: ${metaErrMsg}`);
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const message = await tx.message.create({
        data: {
          organizationId,
          phoneNumberId: conversation.phoneNumberId,
          contactId: conversation.contactId,
          conversationId: conversation.id,
          direction: MessageDirection.OUTBOUND,
          type: dto.type,
          status: hasLiveMetaToken ? MessageStatus.SENT : MessageStatus.QUEUED,
          wamid: liveWamid,
          sentAt: hasLiveMetaToken ? now : undefined,
          body: dto.body || (template ? `[Template: ${template.name}]` : undefined),
          templateId: dto.templateId,
          templateParameters: (dto.templateParameters as any) || null,
          mediaUrl: dto.mediaUrl,
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
        // Enqueue to outbox
        await tx.outboxEvent.create({
          data: {
            organizationId,
            type: JobType.SEND_INDIVIDUAL_MESSAGE,
            payload: {
              messageId: message.id,
              phoneNumberId: conversation.phoneNumberId,
              recipientPhone: conversation.contact.phone,
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
            idempotencyKey: `reply_${message.id}`,
          },
        });
      }

      // Update conversation
      const updatedConv = await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: now,
          lastMessagePreview: dto.body || (template ? `Template: ${template.name}` : 'Media'),
          status: ConversationStatus.OPEN,
        },
      });

      return { message, conversation: updatedConv };
    });

    // Broadcast to real-time room
    this.gateway.broadcastNewMessage(organizationId, result.message);
    this.gateway.broadcastConversationUpdate(organizationId, result.conversation);

    return result.message;
  }

  async assignConversation(
    organizationId: string,
    conversationId: string,
    dto: AssignConversationDto
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (dto.assignedToUserId) {
      const member = await this.prisma.membership.findFirst({
        where: {
          organizationId,
          userId: dto.assignedToUserId,
          isActive: true,
        },
      });
      if (!member) {
        throw new BadRequestException('Agent is not an active member of this organization');
      }
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        assignedToUserId: dto.assignedToUserId || null,
      },
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    this.gateway.broadcastConversationUpdate(organizationId, updated);
    return updated;
  }

  async resolveConversation(
    organizationId: string,
    conversationId: string,
    dto: ResolveConversationDto
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: dto.status },
    });

    this.gateway.broadcastConversationUpdate(organizationId, updated);
    return updated;
  }

  async addInternalNote(
    organizationId: string,
    conversationId: string,
    userId: string,
    dto: AddInternalNoteDto
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.internalNote.create({
      data: {
        conversationId,
        userId,
        content: dto.content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }
}

