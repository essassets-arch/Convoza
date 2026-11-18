import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as os from 'os';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import {
  SuspendOrganizationDto,
  UpdateOrgBillingAdminDto,
  AdminWalletAdjustmentDto,
  AdminUpdateUserDto,
  AdminUpdatePlanDto,
} from './dto/admin.dto';
import {
  SubscriptionStatus,
  MessageStatus,
  MessageDirection,
  JobStatus,
  BillingInterval,
} from '@convoza/shared-types';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private getTelemetrySnapshot() {
    const totalMemMb = Math.round(os.totalmem() / 1024 / 1024);
    const freeMemMb = Math.round(os.freemem() / 1024 / 1024);
    const usedMemMb = totalMemMb - freeMemMb;
    const nodeRssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
    const nodeHeapUsedMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const loadAvg = os.loadavg();

    return {
      hostname: os.hostname(),
      cpuCores: os.cpus().length,
      loadAvg1m: Number(loadAvg[0].toFixed(2)),
      loadAvg5m: Number(loadAvg[1].toFixed(2)),
      totalMemMb,
      usedMemMb,
      freeMemMb,
      memUsagePercent: Math.round((usedMemMb / Math.max(1, totalMemMb)) * 100),
      nodeRssMb,
      nodeHeapUsedMb,
      processUptimeSeconds: Math.round(process.uptime()),
      osUptimeSeconds: Math.round(os.uptime()),
    };
  }

  async getPlatformDashboard() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 3600_000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);

    const [
      totalUsers,
      activeUsers24h,
      onlineSessions,
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      activeSubscriptions,
      connectedWhatsAppAccounts,
      connectedPhoneNumbers,
      totalMessages,
      outboundMessagesCount,
      inboundMessagesCount,
      deliveredMessages,
      readMessages,
      failedMessages,
      activeCampaigns,
      totalTemplates,
      approvedTemplates,
      pendingTemplates,
      rejectedTemplates,
      pendingJobs,
      processingJobs,
      failedJobs,
      deadLetterJobs,
      newInquiriesCount,
      allOrgsWithSubs,
      messages30d,
      successfulPayments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastLoginAt: { gte: twentyFourHoursAgo } } }),
      this.prisma.session.count({ where: { expiresAt: { gt: now } } }),
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { isSuspended: false } }),
      this.prisma.organization.count({ where: { isSuspended: true } }),
      this.prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      this.prisma.whatsAppAccount.count({ where: { status: 'CONNECTED' } }),
      this.prisma.phoneNumber.count(),
      this.prisma.message.count(),
      this.prisma.message.count({ where: { direction: MessageDirection.OUTBOUND } }),
      this.prisma.message.count({ where: { direction: MessageDirection.INBOUND } }),
      this.prisma.message.count({
        where: { direction: MessageDirection.OUTBOUND, status: { in: [MessageStatus.DELIVERED, MessageStatus.READ] } },
      }),
      this.prisma.message.count({
        where: { direction: MessageDirection.OUTBOUND, status: MessageStatus.READ },
      }),
      this.prisma.message.count({
        where: { direction: MessageDirection.OUTBOUND, status: MessageStatus.FAILED },
      }),
      this.prisma.campaign.count({ where: { status: { in: ['PROCESSING', 'SCHEDULED'] } } }),
      this.prisma.template.count(),
      this.prisma.template.count({ where: { status: 'APPROVED' } }),
      this.prisma.template.count({ where: { status: 'PENDING' } }),
      this.prisma.template.count({ where: { status: 'REJECTED' } }),
      this.prisma.outboxEvent.count({ where: { status: JobStatus.PENDING } }),
      this.prisma.outboxEvent.count({ where: { status: JobStatus.PROCESSING } }),
      this.prisma.outboxEvent.count({ where: { status: JobStatus.FAILED } }),
      this.prisma.outboxEvent.count({ where: { status: JobStatus.DEAD_LETTER } }),
      this.prisma.contactInquiry.count({ where: { status: 'NEW' } }),
      this.prisma.organization.findMany({
        include: {
          subscription: { include: { plan: true } },
          _count: {
            select: {
              phoneNumbers: true,
              templates: true,
              contacts: true,
              memberships: true,
            },
          },
        },
      }),
      this.prisma.message.findMany({
        where: {
          direction: MessageDirection.OUTBOUND,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          organizationId: true,
          billingCategory: true,
          type: true,
          metaCostPaise: true,
          chargedPaise: true,
          walletRefunded: true,
        },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
    ]);

    let mrrInr = 0;
    let totalWalletFloatPaise = 0;

    for (const org of allOrgsWithSubs) {
      totalWalletFloatPaise += org.walletBalancePaise || 0;
      if (org.subscription && org.subscription.status === SubscriptionStatus.ACTIVE && org.subscription.plan) {
        if (org.subscription.interval === BillingInterval.YEARLY) {
          mrrInr += Math.round(org.subscription.plan.priceYearly / 12);
        } else {
          mrrInr += org.subscription.plan.priceMonthly;
        }
      }
    }

    let metaWholesale30dPaise = 0;
    let walletBilled30dPaise = 0;
    const categoryStats: Record<string, { count: number; metaCostInr: number; billedInr: number }> = {
      MARKETING: { count: 0, metaCostInr: 0, billedInr: 0 },
      UTILITY: { count: 0, metaCostInr: 0, billedInr: 0 },
      AUTHENTICATION: { count: 0, metaCostInr: 0, billedInr: 0 },
      SERVICE: { count: 0, metaCostInr: 0, billedInr: 0 },
    };

    const org30dMap = new Map<string, { sent: number; metaPaise: number; billedPaise: number }>();

    for (const m of messages30d) {
      const cat = m.billingCategory || (m.type === 'TEMPLATE' ? 'UTILITY' : 'SERVICE');
      if (!categoryStats[cat]) categoryStats[cat] = { count: 0, metaCostInr: 0, billedInr: 0 };
      const charged = m.walletRefunded ? 0 : m.chargedPaise || 0;
      const metaCost = m.metaCostPaise || 0;

      categoryStats[cat].count += 1;
      categoryStats[cat].metaCostInr = Number((categoryStats[cat].metaCostInr + metaCost / 100).toFixed(2));
      categoryStats[cat].billedInr = Number((categoryStats[cat].billedInr + charged / 100).toFixed(2));

      metaWholesale30dPaise += metaCost;
      walletBilled30dPaise += charged;

      const cur = org30dMap.get(m.organizationId) || { sent: 0, metaPaise: 0, billedPaise: 0 };
      cur.sent += 1;
      cur.metaPaise += metaCost;
      cur.billedPaise += charged;
      org30dMap.set(m.organizationId, cur);
    }

    const topTenants = allOrgsWithSubs
      .map((o) => {
        const s30 = org30dMap.get(o.id) || { sent: 0, metaPaise: 0, billedPaise: 0 };
        return {
          id: o.id,
          name: o.name,
          slug: o.slug,
          isSuspended: o.isSuspended,
          planName: o.subscription?.plan?.name || 'Trial',
          planTier: o.subscription?.plan?.tier || 'STARTER',
          billingMode: o.billingMode,
          walletBalanceInr: Number(((o.walletBalancePaise || 0) / 100).toFixed(2)),
          phoneNumbersCount: o._count.phoneNumbers,
          templatesCount: o._count.templates,
          contactsCount: o._count.contacts,
          membersCount: o._count.memberships,
          sent30d: s30.sent,
          metaCost30dInr: Number((s30.metaPaise / 100).toFixed(2)),
          walletBilled30dInr: Number((s30.billedPaise / 100).toFixed(2)),
        };
      })
      .sort((a, b) => b.sent30d - a.sent30d);

    const deliveryRate =
      outboundMessagesCount > 0 ? Number(((deliveredMessages / outboundMessagesCount) * 100).toFixed(1)) : 0;

    const metaWholesale30dInr = Number((metaWholesale30dPaise / 100).toFixed(2));
    const walletBilled30dInr = Number((walletBilled30dPaise / 100).toFixed(2));
    const messagingMargin30dInr = Number(((walletBilled30dPaise - metaWholesale30dPaise) / 100).toFixed(2));

    return {
      totalUsers,
      activeUsers24h,
      onlineSessions,
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      activeSubscriptions,
      connectedWhatsAppAccounts,
      connectedPhoneNumbers,
      totalMessages,
      totalMessagesSent: outboundMessagesCount,
      inboundMessagesCount,
      deliveredMessages,
      readMessages,
      failedMessages,
      deliveryRate,
      activeCampaigns,
      templates: {
        total: totalTemplates,
        approved: approvedTemplates,
        pending: pendingTemplates,
        rejected: rejectedTemplates,
      },
      financials: {
        mrrInr,
        totalPaymentsCollectedInr: successfulPayments._sum.amount || 0,
        totalWalletFloatInr: Number((totalWalletFloatPaise / 100).toFixed(2)),
        metaWholesale30dInr,
        walletBilled30dInr,
        messagingMargin30dInr,
        categoryStats,
      },
      mrrInr,
      queueHealth: {
        pendingJobs,
        processingJobs,
        failedJobs,
        deadLetterJobs,
      },
      newInquiriesCount,
      topTenants,
      telemetry: this.getTelemetrySnapshot(),
    };
  }

  async getOrganizations(query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);

    const where: any = {};
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, orgs] = await Promise.all([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: { include: { plan: true } },
          memberships: {
            where: { isActive: true },
            include: { user: { select: { id: true, name: true, email: true, lastLoginAt: true } } },
            orderBy: { createdAt: 'asc' },
          },
          phoneNumbers: {
            select: {
              id: true,
              displayPhoneNumber: true,
              verifiedName: true,
              qualityRating: true,
              messagingLimitTier: true,
            },
          },
          _count: {
            select: {
              memberships: true,
              phoneNumbers: true,
              templates: true,
              campaigns: true,
              messages: true,
              contacts: true,
            },
          },
        },
      }),
    ]);

    const orgIds = orgs.map((o) => o.id);
    const msgs30d =
      orgIds.length > 0
        ? await this.prisma.message.findMany({
            where: {
              organizationId: { in: orgIds },
              direction: MessageDirection.OUTBOUND,
              createdAt: { gte: thirtyDaysAgo },
            },
            select: { organizationId: true, metaCostPaise: true, chargedPaise: true, walletRefunded: true },
          })
        : [];

    const costMap = new Map<string, { count: number; metaPaise: number; billedPaise: number }>();
    for (const m of msgs30d) {
      const cur = costMap.get(m.organizationId) || { count: 0, metaPaise: 0, billedPaise: 0 };
      cur.count += 1;
      cur.metaPaise += m.metaCostPaise || 0;
      cur.billedPaise += m.walletRefunded ? 0 : m.chargedPaise || 0;
      costMap.set(m.organizationId, cur);
    }

    const items = orgs.map((o) => {
      const ownerMem = o.memberships.find((m) => m.role === 'ORG_OWNER') || o.memberships[0];
      const c30 = costMap.get(o.id) || { count: 0, metaPaise: 0, billedPaise: 0 };
      return {
        ...o,
        owner: ownerMem?.user || null,
        walletBalanceInr: Number(((o.walletBalancePaise || 0) / 100).toFixed(2)),
        usage30d: {
          outboundMessages: c30.count,
          metaCostInr: Number((c30.metaPaise / 100).toFixed(2)),
          walletBilledInr: Number((c30.billedPaise / 100).toFixed(2)),
        },
      };
    });

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

  async getOrganizationDetail(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
        memberships: {
          include: { user: { select: { id: true, name: true, email: true, phone: true, lastLoginAt: true } } },
        },
        whatsAppAccounts: {
          include: { phoneNumbers: true },
        },
        templates: {
          orderBy: { updatedAt: 'desc' },
          take: 50,
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            contacts: true,
            messages: true,
            campaigns: true,
            templates: true,
            automations: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return {
      ...org,
      walletBalanceInr: Number(((org.walletBalancePaise || 0) / 100).toFixed(2)),
    };
  }

  async suspendOrganization(id: string, dto: SuspendOrganizationDto, adminUserId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        isSuspended: true,
        suspensionReason: dto.reason,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: id,
        userId: adminUserId,
        action: 'SUSPEND_ORGANIZATION',
        resource: 'Organization',
        resourceId: id,
        metadata: { reason: dto.reason },
      },
    });

    return updated;
  }

  async restoreOrganization(id: string, adminUserId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        isSuspended: false,
        suspensionReason: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId: id,
        userId: adminUserId,
        action: 'RESTORE_ORGANIZATION',
        resource: 'Organization',
        resourceId: id,
      },
    });

    return updated;
  }

  async updateOrganizationBilling(id: string, dto: UpdateOrgBillingAdminDto, adminUserId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const orgData: any = {};
      if (dto.billingMode) orgData.billingMode = dto.billingMode;
      if (dto.rateMarketingPaise !== undefined) orgData.rateMarketingPaise = dto.rateMarketingPaise;
      if (dto.rateUtilityPaise !== undefined) orgData.rateUtilityPaise = dto.rateUtilityPaise;
      if (dto.rateAuthPaise !== undefined) orgData.rateAuthPaise = dto.rateAuthPaise;
      if (dto.rateServicePaise !== undefined) orgData.rateServicePaise = dto.rateServicePaise;

      if (Object.keys(orgData).length > 0) {
        await tx.organization.update({ where: { id }, data: orgData });
      }

      if (dto.planId || dto.subscriptionStatus || dto.currentPeriodEnd) {
        const existingSub = await tx.subscription.findUnique({ where: { organizationId: id } });
        const fallbackPlan = dto.planId
          ? await tx.plan.findUnique({ where: { id: dto.planId } })
          : await tx.plan.findFirst({ orderBy: { priceMonthly: 'asc' } });

        if (existingSub) {
          await tx.subscription.update({
            where: { organizationId: id },
            data: {
              ...(dto.planId ? { planId: dto.planId } : {}),
              ...(dto.subscriptionStatus ? { status: dto.subscriptionStatus as any } : {}),
              ...(dto.currentPeriodEnd ? { currentPeriodEnd: new Date(dto.currentPeriodEnd) } : {}),
            },
          });
        } else if (fallbackPlan) {
          await tx.subscription.create({
            data: {
              organizationId: id,
              planId: fallbackPlan.id,
              status: (dto.subscriptionStatus as any) || SubscriptionStatus.ACTIVE,
              currentPeriodEnd: dto.currentPeriodEnd
                ? new Date(dto.currentPeriodEnd)
                : new Date(Date.now() + 30 * 86400_000),
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          organizationId: id,
          userId: adminUserId,
          action: 'UPDATE_ORG_BILLING',
          resource: 'Organization',
          resourceId: id,
          metadata: dto as any,
        },
      });
    });

    return this.getOrganizationDetail(id);
  }

  async adjustOrganizationWallet(id: string, dto: AdminWalletAdjustmentDto, adminUserId: string) {
    const amountPaise = Math.round(dto.amountInr * 100);
    if (amountPaise <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.findUnique({ where: { id } });
      if (!org) {
        throw new NotFoundException('Organization not found');
      }

      const delta = dto.type === 'CREDIT' ? amountPaise : -amountPaise;
      const newBalance = Math.max(0, org.walletBalancePaise + delta);

      const updatedOrg = await tx.organization.update({
        where: { id },
        data: { walletBalancePaise: newBalance },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          organizationId: id,
          type: dto.type === 'CREDIT' ? 'CREDIT_ADMIN' : 'DEBIT_ADMIN',
          amountPaise,
          balanceAfterPaise: updatedOrg.walletBalancePaise,
          description: dto.description.trim(),
          referenceId: adminUserId,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: id,
          userId: adminUserId,
          action: `WALLET_${dto.type}`,
          resource: 'WalletTransaction',
          resourceId: txn.id,
          metadata: { amountInr: dto.amountInr, description: dto.description, newBalancePaise: newBalance },
        },
      });

      return {
        walletBalancePaise: updatedOrg.walletBalancePaise,
        walletBalanceInr: Number((updatedOrg.walletBalancePaise / 100).toFixed(2)),
        transaction: txn,
      };
    });
  }

  async getUsers(query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {};
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, rawUsers] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          isSuperAdmin: true,
          twoFactorEnabled: true,
          isActive: true,
          lastLoginAt: true,
          lastLoginIp: true,
          createdAt: true,
          memberships: {
            include: {
              organization: { select: { id: true, name: true, slug: true } },
            },
          },
          sessions: {
            where: { expiresAt: { gt: now } },
            select: { id: true, ipAddress: true, userAgent: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
          },
        },
      }),
    ]);

    const items = rawUsers.map((u) => ({
      ...u,
      activeSessionsCount: u.sessions.length,
      latestSession: u.sessions[0] || null,
    }));

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

  async updateUser(userId: string, dto: AdminUpdateUserDto, adminUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userId === adminUserId && (dto.isActive === false || dto.isSuperAdmin === false)) {
      throw new BadRequestException('You cannot deactivate or demote your own Super Admin account');
    }

    const data: any = {};
    if (dto.name && dto.name.trim()) data.name = dto.name.trim();
    if (dto.email && dto.email.trim()) data.email = dto.email.toLowerCase().trim();
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isSuperAdmin !== undefined) data.isSuperAdmin = dto.isSuperAdmin;
    if (dto.newPassword && dto.newPassword.length >= 8) {
      const salt = await bcrypt.genSalt(12);
      data.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isSuperAdmin: true,
      },
    });

    if (dto.isActive === false) {
      await this.prisma.session.deleteMany({ where: { userId } });
    }

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'ADMIN_UPDATE_USER',
        resource: 'User',
        resourceId: userId,
        metadata: {
          isActive: dto.isActive,
          isSuperAdmin: dto.isSuperAdmin,
          passwordReset: Boolean(dto.newPassword),
        },
      },
    });

    return updated;
  }

  async revokeUserSessions(userId: string, adminUserId: string) {
    const deleted = await this.prisma.session.deleteMany({ where: { userId } });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'REVOKE_USER_SESSIONS',
        resource: 'User',
        resourceId: userId,
        metadata: { revokedSessions: deleted.count },
      },
    });

    return { revokedCount: deleted.count };
  }

  async getGlobalWhatsAppAssets() {
    const accounts = await this.prisma.whatsAppAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, slug: true, isSuspended: true } },
        phoneNumbers: true,
        credentials: { select: { id: true, tokenExpiresAt: true, updatedAt: true } },
        _count: { select: { templates: true } },
      },
    });

    return accounts.map((a) => ({
      id: a.id,
      wabaId: a.wabaId,
      name: a.name,
      status: a.status,
      onboardingType: a.onboardingType,
      webhookSubscribed: a.webhookSubscribed,
      hasLiveToken: Boolean(a.credentials?.id),
      templatesCount: a._count.templates,
      organization: a.organization,
      phoneNumbers: a.phoneNumbers,
      createdAt: a.createdAt,
    }));
  }

  async getGlobalTemplates(query: { status?: string; category?: string; search?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { organization: { name: { contains: query.search.trim(), mode: 'insensitive' } } },
      ];
    }

    return this.prisma.template.findMany({
      where,
      take: 200,
      orderBy: { updatedAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        whatsappAccount: { select: { id: true, name: true, wabaId: true } },
      },
    });
  }

  async getBillingOverview() {
    const [plans, rawSettings, payments, invoices, walletTransactions] = await Promise.all([
      this.prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } }),
      this.prisma.systemSetting.findMany(),
      this.prisma.payment.findMany({
        take: 40,
        orderBy: { createdAt: 'desc' },
        include: { organization: { select: { id: true, name: true } } },
      }),
      this.prisma.invoice.findMany({
        take: 40,
        orderBy: { createdAt: 'desc' },
        include: { organization: { select: { id: true, name: true } } },
      }),
      this.prisma.walletTransaction.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { organization: { select: { id: true, name: true } } },
      }),
    ]);

    const settings: Record<string, string> = {};
    for (const s of rawSettings) {
      if (s.key === 'RAZORPAY_KEY_SECRET' && s.value) {
        settings[s.key] = `••••••••${s.value.slice(-4)}`;
      } else {
        settings[s.key] = s.value;
      }
    }

    return {
      plans,
      settings,
      razorpayConfigured: Boolean(
        rawSettings.find((s) => s.key === 'RAZORPAY_KEY_ID')?.value || process.env.RAZORPAY_KEY_ID
      ),
      payments,
      invoices,
      walletTransactions,
    };
  }

  async updatePlan(planId: string, dto: AdminUpdatePlanDto, adminUserId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const updated = await this.prisma.plan.update({
      where: { id: planId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description ? { description: dto.description.trim() } : {}),
        ...(dto.priceMonthly !== undefined ? { priceMonthly: Math.max(0, Math.round(dto.priceMonthly)) } : {}),
        ...(dto.priceYearly !== undefined ? { priceYearly: Math.max(0, Math.round(dto.priceYearly)) } : {}),
        ...(dto.maxWhatsAppAccounts !== undefined ? { maxWhatsAppAccounts: Math.max(1, Math.round(dto.maxWhatsAppAccounts)) } : {}),
        ...(dto.maxUsers !== undefined ? { maxUsers: Math.max(1, Math.round(dto.maxUsers)) } : {}),
        ...(dto.contactAllowance !== undefined ? { contactAllowance: Math.max(100, Math.round(dto.contactAllowance)) } : {}),
        ...(dto.campaignMonthlyLimit !== undefined ? { campaignMonthlyLimit: Math.max(100, Math.round(dto.campaignMonthlyLimit)) } : {}),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_BILLING_PLAN',
        resource: 'Plan',
        resourceId: planId,
        metadata: dto as any,
      },
    });

    return updated;
  }

  async updateSystemSettings(updates: Record<string, string>, adminUserId: string) {
    const allowedKeys = new Set([
      'PLATFORM_COMPANY_NAME',
      'PLATFORM_SUPPORT_EMAIL',
      'GST_PERCENT',
      'META_COST_MARKETING_PAISE',
      'META_COST_UTILITY_PAISE',
      'META_COST_AUTH_PAISE',
      'META_COST_SERVICE_PAISE',
      'DEFAULT_SELL_MARKETING_PAISE',
      'DEFAULT_SELL_UTILITY_PAISE',
      'DEFAULT_SELL_AUTH_PAISE',
      'DEFAULT_SELL_SERVICE_PAISE',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
    ]);

    for (const [key, val] of Object.entries(updates || {})) {
      if (!allowedKeys.has(key)) continue;
      if (key === 'RAZORPAY_KEY_SECRET' && String(val).startsWith('••••')) continue;
      await this.prisma.systemSetting.upsert({
        where: { key },
        create: { key, value: String(val).trim() },
        update: { value: String(val).trim() },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_SYSTEM_SETTINGS',
        resource: 'SystemSetting',
        metadata: { updatedKeys: Object.keys(updates || {}).filter((k) => k !== 'RAZORPAY_KEY_SECRET') },
      },
    });

    return { updated: true };
  }

  async getSystemHealth(jobStatus?: string) {
    const jobWhere: any = {};
    if (jobStatus && jobStatus !== 'ALL') {
      jobWhere.status = jobStatus;
    }

    const [jobs, inquiries, pendingCount, processingCount, failedCount, dlqCount, completedCount] =
      await Promise.all([
        this.prisma.outboxEvent.findMany({
          where: jobWhere,
          take: 60,
          orderBy: { createdAt: 'desc' },
          include: { organization: { select: { id: true, name: true } } },
        }),
        this.prisma.contactInquiry.findMany({
          take: 40,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.outboxEvent.count({ where: { status: JobStatus.PENDING } }),
        this.prisma.outboxEvent.count({ where: { status: JobStatus.PROCESSING } }),
        this.prisma.outboxEvent.count({ where: { status: JobStatus.FAILED } }),
        this.prisma.outboxEvent.count({ where: { status: JobStatus.DEAD_LETTER } }),
        this.prisma.outboxEvent.count({ where: { status: JobStatus.COMPLETED } }),
      ]);

    return {
      telemetry: this.getTelemetrySnapshot(),
      queueSummary: {
        pending: pendingCount,
        processing: processingCount,
        failed: failedCount,
        deadLetter: dlqCount,
        completed: completedCount,
      },
      jobs,
      inquiries,
    };
  }

  async retryOutboxJob(jobId: string, adminUserId: string) {
    const job = await this.prisma.outboxEvent.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const updated = await this.prisma.outboxEvent.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PENDING,
        attempts: 0,
        lastError: null,
        lockedAt: null,
        lockedBy: null,
        scheduledFor: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'RETRY_OUTBOX_JOB',
        resource: 'OutboxEvent',
        resourceId: jobId,
      },
    });

    return updated;
  }

  async recoverStaleOutboxLocks(adminUserId: string) {
    const twoMinutesAgo = new Date(Date.now() - 120_000);
    const res = await this.prisma.outboxEvent.updateMany({
      where: {
        status: JobStatus.PROCESSING,
        lockedAt: { lt: twoMinutesAgo },
      },
      data: {
        status: JobStatus.PENDING,
        lockedAt: null,
        lockedBy: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'RECOVER_STALE_LOCKS',
        resource: 'OutboxEvent',
        metadata: { recoveredCount: res.count },
      },
    });

    return { recoveredCount: res.count };
  }

  async deleteOutboxJob(jobId: string, adminUserId: string) {
    await this.prisma.outboxEvent.delete({ where: { id: jobId } });
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'DELETE_OUTBOX_JOB',
        resource: 'OutboxEvent',
        resourceId: jobId,
      },
    });
    return { deleted: true };
  }

  async updateContactInquiry(id: string, status: string) {
    return this.prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });
  }

  async getAuditLogs(query: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { action: { contains: term, mode: 'insensitive' } },
        { resource: { contains: term, mode: 'insensitive' } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
        { organization: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true } },
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
}
