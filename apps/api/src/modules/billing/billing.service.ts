import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCheckoutDto,
  VerifyPaymentDto,
  CreateWalletTopupDto,
  VerifyWalletTopupDto,
} from './dto/billing.dto';
import {
  SubscriptionStatus,
  BillingInterval,
} from '@convoza/shared-types';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemSettingsMap(): Promise<Record<string, string>> {
    const rows = await this.prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  }

  private async getRazorpayCredentials(): Promise<{ keyId: string; keySecret: string }> {
    const settings = await this.getSystemSettingsMap();
    const keyId = (settings['RAZORPAY_KEY_ID'] || process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (settings['RAZORPAY_KEY_SECRET'] || process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (
      !keyId ||
      !keySecret ||
      keyId.includes('placeholder') ||
      keyId === 'rzp_test_convoza_key_id' ||
      keySecret === 'convoza_razorpay_secret'
    ) {
      throw new BadRequestException(
        'Razorpay payment gateway credentials are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Super Admin → Billing & Rate Cards.'
      );
    }

    return { keyId, keySecret };
  }

  async getRateCard(organizationId?: string) {
    const settings = await this.getSystemSettingsMap();
    const org = organizationId
      ? await this.prisma.organization.findUnique({ where: { id: organizationId } })
      : null;

    const metaMarketingPaise = Number(settings['META_COST_MARKETING_PAISE'] ?? 79);
    const metaUtilityPaise = Number(settings['META_COST_UTILITY_PAISE'] ?? 12);
    const metaAuthPaise = Number(settings['META_COST_AUTH_PAISE'] ?? 12);
    const metaServicePaise = Number(settings['META_COST_SERVICE_PAISE'] ?? 0);

    const sellMarketingPaise = org?.rateMarketingPaise ?? Number(settings['DEFAULT_SELL_MARKETING_PAISE'] ?? 99);
    const sellUtilityPaise = org?.rateUtilityPaise ?? Number(settings['DEFAULT_SELL_UTILITY_PAISE'] ?? 25);
    const sellAuthPaise = org?.rateAuthPaise ?? Number(settings['DEFAULT_SELL_AUTH_PAISE'] ?? 25);
    const sellServicePaise = org?.rateServicePaise ?? Number(settings['DEFAULT_SELL_SERVICE_PAISE'] ?? 0);
    const gstPercent = Number(settings['GST_PERCENT'] ?? 18);

    return {
      gstPercent,
      billingMode: org?.billingMode || 'DIRECT_META',
      walletBalancePaise: org?.walletBalancePaise || 0,
      metaWholesalePaise: {
        MARKETING: metaMarketingPaise,
        UTILITY: metaUtilityPaise,
        AUTHENTICATION: metaAuthPaise,
        SERVICE: metaServicePaise,
      },
      sellingRatePaise: {
        MARKETING: sellMarketingPaise,
        UTILITY: sellUtilityPaise,
        AUTHENTICATION: sellAuthPaise,
        SERVICE: sellServicePaise,
      },
    };
  }

  /**
   * Computes Meta wholesale cost & (if PREPAID_WALLET) atomically debits tenant wallet
   */
  async evaluateAndDebitMessageCost(
    organizationId: string,
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE',
    referenceDescription: string
  ): Promise<{
    billingCategory: string;
    isBillable: boolean;
    metaCostPaise: number;
    chargedPaise: number;
  }> {
    const rates = await this.getRateCard(organizationId);
    const metaCostPaise = rates.metaWholesalePaise[category] ?? 0;
    const isBillable = category !== 'SERVICE' && metaCostPaise > 0;
    const sellPaise = rates.sellingRatePaise[category] ?? 0;

    if (rates.billingMode !== 'PREPAID_WALLET' || sellPaise <= 0) {
      return {
        billingCategory: category,
        isBillable,
        metaCostPaise,
        chargedPaise: 0,
      };
    }

    // Atomic wallet balance check & debit
    await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.findUnique({
        where: { id: organizationId },
        select: { walletBalancePaise: true },
      });

      if (!org || org.walletBalancePaise < sellPaise) {
        const balInr = ((org?.walletBalancePaise || 0) / 100).toFixed(2);
        const reqInr = (sellPaise / 100).toFixed(2);
        throw new BadRequestException(
          `Insufficient Convoza Prepaid Wallet balance (₹${balInr} available, ₹${reqInr} required for ${category} template). Please top up your wallet in Billing & Quota.`
        );
      }

      const newBalance = org.walletBalancePaise - sellPaise;
      await tx.organization.update({
        where: { id: organizationId },
        data: { walletBalancePaise: newBalance },
      });

      await tx.walletTransaction.create({
        data: {
          organizationId,
          type: 'DEBIT_MESSAGE',
          amountPaise: sellPaise,
          balanceAfterPaise: newBalance,
          description: referenceDescription,
        },
      });
    });

    return {
      billingCategory: category,
      isBillable: true,
      metaCostPaise,
      chargedPaise: sellPaise,
    };
  }

  /**
   * Automatically refunds wallet if Meta webhook reports FAILED delivery
   */
  async refundFailedMessageIfCharged(messageId: string) {
    await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.findUnique({ where: { id: messageId } });
      if (!msg || msg.chargedPaise <= 0 || msg.walletRefunded) {
        return;
      }

      const org = await tx.organization.update({
        where: { id: msg.organizationId },
        data: { walletBalancePaise: { increment: msg.chargedPaise } },
      });

      await tx.message.update({
        where: { id: messageId },
        data: { walletRefunded: true, metaCostPaise: 0, isBillable: false },
      });

      await tx.walletTransaction.create({
        data: {
          organizationId: msg.organizationId,
          type: 'CREDIT_REFUND',
          amountPaise: msg.chargedPaise,
          balanceAfterPaise: org.walletBalancePaise,
          description: `Auto-refund for undelivered WhatsApp message (${msg.id.slice(0, 8)})`,
          referenceId: msg.id,
        },
      });
    });
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async getSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    if (!subscription) {
      const starterPlan = await this.prisma.plan.findFirst({ orderBy: { priceMonthly: 'asc' } });
      return {
        organizationId,
        status: SubscriptionStatus.TRIALING,
        interval: BillingInterval.MONTHLY,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 86400_000),
        plan: starterPlan,
      };
    }

    return subscription;
  }

  async getWalletSummary(organizationId: string) {
    const [org, rates, transactions] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: organizationId } }),
      this.getRateCard(organizationId),
      this.prisma.walletTransaction.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);
    const recentMessages = await this.prisma.message.findMany({
      where: {
        organizationId,
        direction: 'OUTBOUND',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        billingCategory: true,
        type: true,
        metaCostPaise: true,
        chargedPaise: true,
        walletRefunded: true,
      },
    });

    let metaEstimatedPaise = 0;
    let walletChargedPaise = 0;
    const categoryCounts: Record<string, number> = {
      MARKETING: 0,
      UTILITY: 0,
      AUTHENTICATION: 0,
      SERVICE: 0,
    };

    for (const m of recentMessages) {
      const cat = m.billingCategory || (m.type === 'TEMPLATE' ? 'UTILITY' : 'SERVICE');
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      metaEstimatedPaise += m.metaCostPaise || 0;
      if (!m.walletRefunded) {
        walletChargedPaise += m.chargedPaise || 0;
      }
    }

    const settings = await this.getSystemSettingsMap();
    const gatewayConfigured = Boolean(
      (settings['RAZORPAY_KEY_ID'] || process.env.RAZORPAY_KEY_ID || '').trim() &&
        !(settings['RAZORPAY_KEY_ID'] || process.env.RAZORPAY_KEY_ID || '').includes('rzp_test_convoza_key_id')
    );

    return {
      billingMode: org.billingMode,
      walletBalancePaise: org.walletBalancePaise,
      walletBalanceInr: Number((org.walletBalancePaise / 100).toFixed(2)),
      gatewayConfigured,
      ratesInr: {
        MARKETING: Number((rates.sellingRatePaise.MARKETING / 100).toFixed(2)),
        UTILITY: Number((rates.sellingRatePaise.UTILITY / 100).toFixed(2)),
        AUTHENTICATION: Number((rates.sellingRatePaise.AUTHENTICATION / 100).toFixed(2)),
        SERVICE: Number((rates.sellingRatePaise.SERVICE / 100).toFixed(2)),
      },
      metaWholesaleRatesInr: {
        MARKETING: Number((rates.metaWholesalePaise.MARKETING / 100).toFixed(2)),
        UTILITY: Number((rates.metaWholesalePaise.UTILITY / 100).toFixed(2)),
        AUTHENTICATION: Number((rates.metaWholesalePaise.AUTHENTICATION / 100).toFixed(2)),
        SERVICE: 0,
      },
      last30Days: {
        metaEstimatedInr: Number((metaEstimatedPaise / 100).toFixed(2)),
        walletChargedInr: Number((walletChargedPaise / 100).toFixed(2)),
        categoryCounts,
      },
      transactions,
    };
  }

  private verifyHmacSignature(orderId: string, paymentId: string, providedSig: string, keySecret: string): boolean {
    const expectedHex = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const a = Buffer.from(expectedHex, 'utf8');
    const b = Buffer.from(providedSig || '', 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  async createCheckout(organizationId: string, dto: CreateCheckoutDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Selected subscription plan was not found');
    }

    const { keyId, keySecret } = await this.getRazorpayCredentials();
    const rates = await this.getRateCard(organizationId);

    const subtotalInr = dto.interval === BillingInterval.YEARLY ? plan.priceYearly : plan.priceMonthly;
    const taxAmountInr = Math.round((subtotalInr * rates.gstPercent) / 100);
    const totalInr = subtotalInr + taxAmountInr;
    const amountPaise = totalInr * 100;

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    let rzpOrder: any;
    try {
      const res = await axios.post(
        'https://api.razorpay.com/v1/orders',
        {
          amount: amountPaise,
          currency: 'INR',
          receipt: `sub_${organizationId.slice(0, 8)}_${Date.now()}`,
          notes: {
            organizationId,
            purpose: 'SUBSCRIPTION',
            planId: plan.id,
            interval: dto.interval,
          },
        },
        {
          headers: { Authorization: `Basic ${authHeader}`, 'Content-Type': 'application/json' },
          timeout: 12000,
        }
      );
      rzpOrder = res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error?.description || err.message;
      throw new BadRequestException(`Razorpay order creation failed: ${msg}`);
    }

    await this.prisma.payment.create({
      data: {
        organizationId,
        amount: totalInr,
        currency: 'INR',
        status: 'PENDING',
        provider: 'RAZORPAY',
        transactionId: rzpOrder.id,
        razorpayOrderId: rzpOrder.id,
        rawPayload: {
          purpose: 'SUBSCRIPTION',
          planId: plan.id,
          interval: dto.interval,
          subtotalInr,
          taxAmountInr,
          totalInr,
        },
      },
    });

    return {
      orderId: rzpOrder.id,
      amountPaise,
      subtotalInr,
      taxAmountInr,
      totalInr,
      currency: 'INR',
      plan: { id: plan.id, name: plan.name, tier: plan.tier },
      interval: dto.interval,
      keyId,
    };
  }

  async verifyPayment(organizationId: string, dto: VerifyPaymentDto) {
    const { keySecret } = await this.getRazorpayCredentials();

    if (!this.verifyHmacSignature(dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature, keySecret)) {
      throw new BadRequestException('Cryptographic Razorpay payment signature verification failed');
    }

    const pendingPayment = await this.prisma.payment.findFirst({
      where: {
        organizationId,
        razorpayOrderId: dto.razorpayOrderId,
      },
    });

    if (!pendingPayment) {
      throw new NotFoundException('Matching pending checkout order not found for this organization');
    }

    if (pendingPayment.status === 'SUCCESS') {
      const sub = await this.getSubscription(organizationId);
      return { success: true, subscription: sub, alreadyProcessed: true };
    }

    const meta = (pendingPayment.rawPayload as any) || {};
    const planId = meta.planId || dto.planId;
    const interval = (meta.interval || dto.interval) as BillingInterval;

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'SUCCESS',
          transactionId: dto.razorpayPaymentId,
          razorpayPaymentId: dto.razorpayPaymentId,
        },
      });

      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      if (interval === BillingInterval.YEARLY) {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      }

      const subscription = await tx.subscription.upsert({
        where: { organizationId },
        create: {
          organizationId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          interval,
          currentPeriodStart,
          currentPeriodEnd,
        },
        update: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          interval,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: false,
        },
      });

      const invoiceNumber = `INV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await tx.invoice.create({
        data: {
          organizationId,
          subtotal: meta.subtotalInr ?? pendingPayment.amount,
          taxAmount: meta.taxAmountInr ?? 0,
          amount: pendingPayment.amount,
          gstin: org?.gstin || null,
          description: `${plan.name} (${interval}) SaaS Subscription`,
          currency: 'INR',
          status: 'PAID',
          invoiceNumber,
          paidAt: new Date(),
        },
      });

      return { success: true, subscription, payment };
    });
  }

  async createWalletTopupOrder(organizationId: string, dto: CreateWalletTopupDto) {
    const { keyId, keySecret } = await this.getRazorpayCredentials();
    const rates = await this.getRateCard(organizationId);

    const subtotalInr = Math.round(dto.amountInr);
    const taxAmountInr = Math.round((subtotalInr * rates.gstPercent) / 100);
    const totalInr = subtotalInr + taxAmountInr;
    const amountPaise = totalInr * 100;
    const creditPaise = subtotalInr * 100;

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    let rzpOrder: any;
    try {
      const res = await axios.post(
        'https://api.razorpay.com/v1/orders',
        {
          amount: amountPaise,
          currency: 'INR',
          receipt: `wlt_${organizationId.slice(0, 8)}_${Date.now()}`,
          notes: {
            organizationId,
            purpose: 'WALLET_TOPUP',
            creditPaise: String(creditPaise),
          },
        },
        {
          headers: { Authorization: `Basic ${authHeader}`, 'Content-Type': 'application/json' },
          timeout: 12000,
        }
      );
      rzpOrder = res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error?.description || err.message;
      throw new BadRequestException(`Razorpay order creation failed: ${msg}`);
    }

    await this.prisma.payment.create({
      data: {
        organizationId,
        amount: totalInr,
        currency: 'INR',
        status: 'PENDING',
        provider: 'RAZORPAY',
        transactionId: rzpOrder.id,
        razorpayOrderId: rzpOrder.id,
        rawPayload: {
          purpose: 'WALLET_TOPUP',
          subtotalInr,
          taxAmountInr,
          totalInr,
          creditPaise,
        },
      },
    });

    return {
      orderId: rzpOrder.id,
      amountPaise,
      subtotalInr,
      taxAmountInr,
      totalInr,
      creditInr: subtotalInr,
      currency: 'INR',
      keyId,
    };
  }

  async verifyWalletTopup(organizationId: string, dto: VerifyWalletTopupDto) {
    const { keySecret } = await this.getRazorpayCredentials();

    if (!this.verifyHmacSignature(dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature, keySecret)) {
      throw new BadRequestException('Cryptographic Razorpay payment signature verification failed');
    }

    const pendingPayment = await this.prisma.payment.findFirst({
      where: { organizationId, razorpayOrderId: dto.razorpayOrderId },
    });

    if (!pendingPayment) {
      throw new NotFoundException('Pending wallet top-up order not found');
    }

    if (pendingPayment.status === 'SUCCESS') {
      return this.getWalletSummary(organizationId);
    }

    const meta = (pendingPayment.rawPayload as any) || {};
    const creditPaise = Number(meta.creditPaise || (meta.subtotalInr || pendingPayment.amount) * 100);
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'SUCCESS',
          transactionId: dto.razorpayPaymentId,
          razorpayPaymentId: dto.razorpayPaymentId,
        },
      });

      const updatedOrg = await tx.organization.update({
        where: { id: organizationId },
        data: { walletBalancePaise: { increment: creditPaise } },
      });

      await tx.walletTransaction.create({
        data: {
          organizationId,
          type: 'CREDIT_TOPUP',
          amountPaise: creditPaise,
          balanceAfterPaise: updatedOrg.walletBalancePaise,
          description: `Razorpay Wallet Top-Up (${dto.razorpayPaymentId})`,
          referenceId: dto.razorpayPaymentId,
        },
      });

      const invoiceNumber = `INV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await tx.invoice.create({
        data: {
          organizationId,
          subtotal: meta.subtotalInr ?? Math.round(creditPaise / 100),
          taxAmount: meta.taxAmountInr ?? 0,
          amount: pendingPayment.amount,
          gstin: org?.gstin || null,
          description: `Prepaid Messaging Wallet Credit (₹${Math.round(creditPaise / 100).toLocaleString()})`,
          currency: 'INR',
          status: 'PAID',
          invoiceNumber,
          paidAt: new Date(),
        },
      });
    });

    return this.getWalletSummary(organizationId);
  }

  async getInvoices(organizationId: string) {
    return this.prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUsage(organizationId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [messagesSentThisMonth, totalContacts, phoneNumbersCount, teamMembersCount] = await Promise.all([
      this.prisma.message.count({
        where: {
          organizationId,
          direction: 'OUTBOUND',
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.contact.count({ where: { organizationId } }),
      this.prisma.phoneNumber.count({ where: { organizationId } }),
      this.prisma.membership.count({ where: { organizationId, isActive: true } }),
    ]);

    const plan = sub?.plan;
    const msgLimit = plan?.campaignMonthlyLimit || 5000;
    const contactLimit = plan?.contactAllowance || 2500;
    const phoneLimit = plan?.maxWhatsAppAccounts || 1;
    const seatLimit = plan?.maxUsers || 3;

    return {
      period: `${now.toLocaleString('en-US', { month: 'long' })} ${now.getFullYear()}`,
      messagesSent: {
        used: messagesSentThisMonth,
        limit: msgLimit,
        percentage: Math.min(100, Math.round((messagesSentThisMonth / msgLimit) * 100)),
      },
      contacts: {
        used: totalContacts,
        limit: contactLimit,
        percentage: Math.min(100, Math.round((totalContacts / contactLimit) * 100)),
      },
      phoneNumbers: {
        used: phoneNumbersCount,
        limit: phoneLimit,
        percentage: Math.min(100, Math.round((phoneNumbersCount / phoneLimit) * 100)),
      },
      teamMembers: {
        used: teamMembersCount,
        limit: seatLimit,
        percentage: Math.min(100, Math.round((teamMembersCount / seatLimit) * 100)),
      },
      plan: plan?.name || 'Starter Plan',
      tier: plan?.tier || 'STARTER',
      priceMonthly: plan?.priceMonthly || 1999,
      priceYearly: plan?.priceYearly || 19990,
      interval: sub?.interval || 'MONTHLY',
      status: sub?.status || SubscriptionStatus.ACTIVE,
      renewalDate: sub?.currentPeriodEnd,
    };
  }
}
