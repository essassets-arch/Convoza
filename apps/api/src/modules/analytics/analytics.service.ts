import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MessageStatus,
  MessageDirection,
  CampaignStatus,
  ConversationStatus,
} from '@convoza/shared-types';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMessages,
      sentCount,
      deliveredCount,
      readCount,
      failedCount,
      inboundCount,
      activeCampaigns,
      totalContacts,
      optedInContacts,
      connectedNumbers,
      openConversations,
      active24hChats,
      approvedTemplates,
      monthlyOutboundMessages,
    ] = await Promise.all([
      this.prisma.message.count({ where: { organizationId } }),
      this.prisma.message.count({
        where: {
          organizationId,
          direction: MessageDirection.OUTBOUND,
          status: { in: [MessageStatus.SENT, MessageStatus.DELIVERED, MessageStatus.READ] },
        },
      }),
      this.prisma.message.count({
        where: {
          organizationId,
          direction: MessageDirection.OUTBOUND,
          status: { in: [MessageStatus.DELIVERED, MessageStatus.READ] },
        },
      }),
      this.prisma.message.count({
        where: { organizationId, direction: MessageDirection.OUTBOUND, status: MessageStatus.READ },
      }),
      this.prisma.message.count({
        where: { organizationId, direction: MessageDirection.OUTBOUND, status: MessageStatus.FAILED },
      }),
      this.prisma.message.count({
        where: { organizationId, direction: MessageDirection.INBOUND },
      }),
      this.prisma.campaign.count({
        where: { organizationId, status: { in: [CampaignStatus.PROCESSING, CampaignStatus.SCHEDULED] } },
      }),
      this.prisma.contact.count({ where: { organizationId } }),
      this.prisma.contact.count({ where: { organizationId, consentStatus: 'OPTED_IN' } }),
      this.prisma.phoneNumber.count({ where: { organizationId } }),
      this.prisma.conversation.count({
        where: { organizationId, status: ConversationStatus.OPEN },
      }),
      this.prisma.conversation.count({
        where: { organizationId, customerWindowExpiresAt: { gt: now } },
      }),
      this.prisma.template.count({
        where: { organizationId, status: 'APPROVED' },
      }),
      this.prisma.message.findMany({
        where: {
          organizationId,
          direction: MessageDirection.OUTBOUND,
          createdAt: { gte: startOfMonth },
        },
        select: {
          billingCategory: true,
          type: true,
          metaCostPaise: true,
          chargedPaise: true,
          walletRefunded: true,
        },
      }),
    ]);

    const totalOutboundAttempts = sentCount + failedCount;
    const deliveryRate = totalOutboundAttempts > 0 ? Number(((deliveredCount / totalOutboundAttempts) * 100).toFixed(1)) : 0;
    const readRate = deliveredCount > 0 ? Number(((readCount / deliveredCount) * 100).toFixed(1)) : 0;
    const replyRate = deliveredCount > 0 ? Number(Math.min(100, (inboundCount / deliveredCount) * 100).toFixed(1)) : 0;
    const failureRate = totalOutboundAttempts > 0 ? Number(((failedCount / totalOutboundAttempts) * 100).toFixed(1)) : 0;

    let monthMetaCostPaise = 0;
    let monthWalletChargedPaise = 0;
    const categoryBreakdown: Record<string, { count: number; metaCostInr: number }> = {
      MARKETING: { count: 0, metaCostInr: 0 },
      UTILITY: { count: 0, metaCostInr: 0 },
      AUTHENTICATION: { count: 0, metaCostInr: 0 },
      SERVICE: { count: 0, metaCostInr: 0 },
    };

    for (const m of monthlyOutboundMessages) {
      const cat = m.billingCategory || (m.type === 'TEMPLATE' ? 'UTILITY' : 'SERVICE');
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, metaCostInr: 0 };
      }
      categoryBreakdown[cat].count += 1;
      categoryBreakdown[cat].metaCostInr = Number(
        (categoryBreakdown[cat].metaCostInr + (m.metaCostPaise || 0) / 100).toFixed(2)
      );
      monthMetaCostPaise += m.metaCostPaise || 0;
      if (!m.walletRefunded) {
        monthWalletChargedPaise += m.chargedPaise || 0;
      }
    }

    return {
      totalMessages,
      sentCount,
      deliveredCount,
      readCount,
      failedCount,
      replyCount: inboundCount,
      activeCampaigns,
      totalContacts,
      optedInContacts,
      connectedNumbers,
      openConversations,
      active24hChats,
      approvedTemplates,
      monthlyCost: {
        metaEstimatedInr: Number((monthMetaCostPaise / 100).toFixed(2)),
        walletChargedInr: Number((monthWalletChargedPaise / 100).toFixed(2)),
        categoryBreakdown,
      },
      rates: {
        deliveryRate,
        readRate,
        replyRate,
        failureRate,
      },
    };
  }

  async getTimeseries(organizationId: string, days = 7) {
    const safeDays = Math.min(90, Math.max(1, Number(days) || 7));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (safeDays - 1));
    startDate.setHours(0, 0, 0, 0);

    const messages = await this.prisma.message.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        status: true,
        direction: true,
        metaCostPaise: true,
        createdAt: true,
      },
    });

    const dayMap = new Map<
      string,
      {
        date: string;
        label: string;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
        inbound: number;
        metaCostInr: number;
      }
    >();

    for (let i = 0; i < safeDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (safeDays - 1 - i));
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap.set(key, { date: key, label, sent: 0, delivered: 0, read: 0, failed: 0, inbound: 0, metaCostInr: 0 });
    }

    for (const msg of messages) {
      const key = msg.createdAt.toISOString().split('T')[0];
      const entry = dayMap.get(key);
      if (entry) {
        if (msg.direction === MessageDirection.INBOUND) {
          entry.inbound++;
        } else {
          entry.sent++;
          entry.metaCostInr = Number((entry.metaCostInr + (msg.metaCostPaise || 0) / 100).toFixed(2));
          if (msg.status === MessageStatus.DELIVERED || msg.status === MessageStatus.READ) {
            entry.delivered++;
          }
          if (msg.status === MessageStatus.READ) {
            entry.read++;
          }
          if (msg.status === MessageStatus.FAILED) {
            entry.failed++;
          }
        }
      }
    }

    return Array.from(dayMap.values());
  }

  async getCampaignsPerformance(organizationId: string) {
    return this.prisma.campaign.findMany({
      where: { organizationId },
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        template: { select: { name: true, category: true } },
        phoneNumber: { select: { displayPhoneNumber: true, verifiedName: true } },
      },
    });
  }
}
