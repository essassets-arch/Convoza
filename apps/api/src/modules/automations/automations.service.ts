import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAutomationDto, UpdateAutomationDto } from './dto/automation.dto';
import { decryptSecret, META_CONFIG, buildMetaMessagePayload } from '@convoza/configuration';
import {
  AutomationTrigger,
  AutomationActionType,
  MessageDirection,
  MessageStatus,
  MessageType,
  ConversationStatus,
  JobType,
  JobStatus,
} from '@convoza/shared-types';

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAutomations(organizationId: string) {
    return this.prisma.automationRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { executions: true } },
      },
    });
  }

  async getAutomationById(organizationId: string, id: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, organizationId },
      include: {
        executions: {
          take: 25,
          orderBy: { executedAt: 'desc' },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    return rule;
  }

  async createAutomation(organizationId: string, dto: CreateAutomationDto) {
    return this.prisma.automationRule.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        description: dto.description?.trim(),
        trigger: dto.trigger,
        conditions: (dto.conditions || []) as any,
        actions: (dto.actions || []) as any,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async updateAutomation(organizationId: string, id: string, dto: UpdateAutomationDto) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, organizationId },
    });

    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    return this.prisma.automationRule.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() }),
        ...(dto.trigger && { trigger: dto.trigger }),
        ...(dto.conditions && { conditions: dto.conditions as any }),
        ...(dto.actions && { actions: dto.actions as any }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async toggleActive(organizationId: string, id: string, isActive: boolean) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, organizationId },
    });

    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    return this.prisma.automationRule.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteAutomation(organizationId: string, id: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, organizationId },
    });

    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    await this.prisma.automationRule.delete({ where: { id } });
    return { success: true, message: 'Automation deleted successfully' };
  }

  async evaluateRules(
    organizationId: string,
    trigger: AutomationTrigger,
    context: {
      contactId: string;
      contactPhone?: string;
      conversationId: string;
      phoneNumberId: string;
      messageText?: string;
    }
  ) {
    const activeRules = await this.prisma.automationRule.findMany({
      where: {
        organizationId,
        trigger,
        isActive: true,
      },
    });

    for (const rule of activeRules) {
      const conditions = (rule.conditions as any[]) || [];
      let matches = true;

      for (const cond of conditions) {
        if (cond.field === 'body') {
          const val = String(cond.value || '').trim().toUpperCase();
          const text = String(context.messageText || '').trim().toUpperCase();
          if (!val) continue;

          if (cond.operator === 'CONTAINS' && !text.includes(val)) {
            matches = false;
            break;
          } else if (cond.operator === 'EQUALS' && text !== val) {
            matches = false;
            break;
          } else if (cond.operator === 'STARTS_WITH' && !text.startsWith(val)) {
            matches = false;
            break;
          }
        }
      }

      if (matches) {
        this.logger.log(`Automation rule "${rule.name}" matched for contact ${context.contactId}`);
        await this.executeRuleActions(rule, context);
      }
    }
  }

  private async executeRuleActions(rule: any, context: any) {
    const actions = (rule.actions as any[]) || [];

    try {
      const phoneRecord = await this.prisma.phoneNumber.findUnique({
        where: { phoneNumberId: context.phoneNumberId },
        include: { whatsappAccount: { include: { credentials: true } } },
      });

      const contact = await this.prisma.contact.findUnique({ where: { id: context.contactId } });
      const recipientPhone = context.contactPhone || contact?.phone || '';
      const encryptedToken = phoneRecord?.whatsappAccount?.credentials?.encryptedToken;
      const decryptedToken = encryptedToken ? decryptSecret(encryptedToken) : '';
      const hasLiveToken =
        Boolean(decryptedToken) &&
        !decryptedToken.includes('placeholder') &&
        !decryptedToken.includes('MetaPermanentToken');

      for (const act of actions) {
        if (act.type === AutomationActionType.SEND_TEXT_MESSAGE && act.config?.text) {
          const replyText = String(act.config.text).trim();
          let liveWamid: string | undefined;

          if (hasLiveToken && recipientPhone) {
            const payload = buildMetaMessagePayload({
              recipientPhone,
              type: MessageType.TEXT,
              body: replyText,
            });
            const metaRes = await axios.post(
              `${META_CONFIG.GRAPH_API_BASE}/${context.phoneNumberId}/messages`,
              payload,
              {
                headers: { Authorization: `Bearer ${decryptedToken}`, 'Content-Type': 'application/json' },
                timeout: 10000,
              }
            );
            liveWamid = metaRes.data?.messages?.[0]?.id;
          }

          const msg = await this.prisma.message.create({
            data: {
              organizationId: rule.organizationId,
              phoneNumberId: context.phoneNumberId,
              contactId: context.contactId,
              conversationId: context.conversationId,
              direction: MessageDirection.OUTBOUND,
              type: MessageType.TEXT,
              status: hasLiveToken ? MessageStatus.SENT : MessageStatus.QUEUED,
              wamid: liveWamid,
              sentAt: hasLiveToken ? new Date() : undefined,
              body: replyText,
              billingCategory: 'SERVICE',
              isBillable: false,
            },
          });

          await this.prisma.conversation.update({
            where: { id: context.conversationId },
            data: { lastMessageAt: new Date(), lastMessagePreview: replyText },
          });

          if (!hasLiveToken) {
            await this.prisma.outboxEvent.create({
              data: {
                organizationId: rule.organizationId,
                type: JobType.SEND_INDIVIDUAL_MESSAGE,
                payload: {
                  messageId: msg.id,
                  phoneNumberId: context.phoneNumberId,
                  recipientPhone,
                  body: replyText,
                  type: MessageType.TEXT,
                },
                status: JobStatus.PENDING,
              },
            });
          }
        } else if (act.type === AutomationActionType.SEND_TEMPLATE && act.config?.templateId) {
          const tpl = await this.prisma.template.findFirst({
            where: { id: act.config.templateId, organizationId: rule.organizationId, status: 'APPROVED' },
          });
          if (tpl && recipientPhone) {
            let liveWamid: string | undefined;
            if (hasLiveToken) {
              const payload = buildMetaMessagePayload({
                recipientPhone,
                type: MessageType.TEMPLATE,
                templateName: tpl.name,
                templateLanguage: tpl.language,
                templateCategory: tpl.category,
                templateComponents: (tpl.components as any[]) || [],
                templateParameters: act.config.parameters || null,
              });
              const metaRes = await axios.post(
                `${META_CONFIG.GRAPH_API_BASE}/${context.phoneNumberId}/messages`,
                payload,
                {
                  headers: { Authorization: `Bearer ${decryptedToken}`, 'Content-Type': 'application/json' },
                  timeout: 10000,
                }
              );
              liveWamid = metaRes.data?.messages?.[0]?.id;
            }
            await this.prisma.message.create({
              data: {
                organizationId: rule.organizationId,
                phoneNumberId: context.phoneNumberId,
                contactId: context.contactId,
                conversationId: context.conversationId,
                direction: MessageDirection.OUTBOUND,
                type: MessageType.TEMPLATE,
                status: hasLiveToken ? MessageStatus.SENT : MessageStatus.QUEUED,
                wamid: liveWamid,
                sentAt: hasLiveToken ? new Date() : undefined,
                templateId: tpl.id,
                body: `[Auto-Template: ${tpl.name}]`,
                billingCategory: tpl.category,
                isBillable: true,
              },
            });
          }
        } else if (act.type === AutomationActionType.ADD_TAG && act.config?.tagName) {
          const tag = await this.prisma.tag.upsert({
            where: {
              organizationId_name: {
                organizationId: rule.organizationId,
                name: act.config.tagName.trim(),
              },
            },
            create: { organizationId: rule.organizationId, name: act.config.tagName.trim() },
            update: {},
          });

          await this.prisma.contactTag.upsert({
            where: {
              contactId_tagId: {
                contactId: context.contactId,
                tagId: tag.id,
              },
            },
            create: { contactId: context.contactId, tagId: tag.id },
            update: {},
          });
        } else if (act.type === AutomationActionType.ASSIGN_AGENT) {
          let targetUserId = act.config?.userId;
          if (!targetUserId) {
            const firstMember = await this.prisma.membership.findFirst({
              where: { organizationId: rule.organizationId, isActive: true },
              orderBy: { createdAt: 'asc' },
            });
            targetUserId = firstMember?.userId;
          }
          if (targetUserId) {
            await this.prisma.conversation.update({
              where: { id: context.conversationId },
              data: { assignedToUserId: targetUserId },
            });
          }
        } else if (act.type === AutomationActionType.RESOLVE_CONVERSATION) {
          await this.prisma.conversation.update({
            where: { id: context.conversationId },
            data: { status: ConversationStatus.RESOLVED },
          });
        }
      }

      await this.prisma.automationExecution.create({
        data: {
          automationRuleId: rule.id,
          contactId: context.contactId,
          status: 'SUCCESS',
        },
      });

      await this.prisma.automationRule.update({
        where: { id: rule.id },
        data: { executionCount: { increment: 1 } },
      });
    } catch (err: any) {
      this.logger.error(`Failed to execute actions for rule ${rule.id}: ${err.message}`);
      await this.prisma.automationExecution.create({
        data: {
          automationRuleId: rule.id,
          contactId: context.contactId,
          status: 'FAILED',
          error: err.message,
        },
      });
    }
  }
}
