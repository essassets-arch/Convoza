import { PrismaClient, BillingPlanTier } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Bootstrapping CONVOZA core plans & system settings...');

  // 1. Ensure Core SaaS Plans exist (update: {} preserves any live Admin price/quota edits)
  await prisma.plan.upsert({
    where: { tier: BillingPlanTier.STARTER },
    create: {
      tier: BillingPlanTier.STARTER,
      name: 'Starter Plan',
      description: 'Essential official WhatsApp Cloud API automation for growing teams',
      priceMonthly: 1999,
      priceYearly: 19990,
      maxWhatsAppAccounts: 1,
      maxUsers: 3,
      contactAllowance: 2500,
      campaignMonthlyLimit: 5000,
      hasApiAccess: true,
      hasSharedInbox: true,
      hasAutomations: true,
      hasAdvancedAnalytics: false,
      storageMbAllowance: 1000,
    },
    update: {},
  });

  await prisma.plan.upsert({
    where: { tier: BillingPlanTier.GROWTH },
    create: {
      tier: BillingPlanTier.GROWTH,
      name: 'Growth Plan',
      description: 'High-throughput broadcasts, automations, and multi-agent shared inbox',
      priceMonthly: 4999,
      priceYearly: 49990,
      maxWhatsAppAccounts: 3,
      maxUsers: 15,
      contactAllowance: 25000,
      campaignMonthlyLimit: 50000,
      hasApiAccess: true,
      hasSharedInbox: true,
      hasAutomations: true,
      hasAdvancedAnalytics: true,
      storageMbAllowance: 10000,
    },
    update: {},
  });

  await prisma.plan.upsert({
    where: { tier: BillingPlanTier.ENTERPRISE },
    create: {
      tier: BillingPlanTier.ENTERPRISE,
      name: 'Enterprise Plan',
      description: 'High-volume WABAs, custom wallet rates, dedicated throughput, and priority SLA',
      priceMonthly: 14999,
      priceYearly: 149990,
      maxWhatsAppAccounts: 10,
      maxUsers: 100,
      contactAllowance: 250000,
      campaignMonthlyLimit: 500000,
      hasApiAccess: true,
      hasSharedInbox: true,
      hasAutomations: true,
      hasAdvancedAnalytics: true,
      storageMbAllowance: 50000,
    },
    update: {},
  });

  // 2. Ensure Default System Settings & Meta Rate Card exist (in INR Paise)
  const defaultSettings: Array<{ key: string; value: string; description: string }> = [
    { key: 'PLATFORM_COMPANY_NAME', value: 'Emperor Smart Solutions', description: 'Legal Tech Provider Entity Name' },
    { key: 'PLATFORM_SUPPORT_EMAIL', value: 'support@emperorsmartsolutions.com', description: 'Customer Support Email' },
    { key: 'GST_PERCENT', value: '18', description: 'GST tax percentage applied to INR invoices' },
    { key: 'META_COST_MARKETING_PAISE', value: '79', description: 'Meta wholesale Marketing message cost (paise)' },
    { key: 'META_COST_UTILITY_PAISE', value: '12', description: 'Meta wholesale Utility message cost (paise)' },
    { key: 'META_COST_AUTH_PAISE', value: '12', description: 'Meta wholesale Authentication message cost (paise)' },
    { key: 'META_COST_SERVICE_PAISE', value: '0', description: 'Meta wholesale 24h Service reply cost (paise)' },
    { key: 'DEFAULT_SELL_MARKETING_PAISE', value: '99', description: 'Default client Prepaid Wallet charge for Marketing (paise)' },
    { key: 'DEFAULT_SELL_UTILITY_PAISE', value: '25', description: 'Default client Prepaid Wallet charge for Utility (paise)' },
    { key: 'DEFAULT_SELL_AUTH_PAISE', value: '25', description: 'Default client Prepaid Wallet charge for Authentication (paise)' },
    { key: 'DEFAULT_SELL_SERVICE_PAISE', value: '0', description: 'Default client Prepaid Wallet charge for 24h Service (paise)' },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }

  // 3. Bootstrap Super Admin ONLY when database has zero Super Admins
  const superAdminCount = await prisma.user.count({ where: { isSuperAdmin: true } });
  if (superAdminCount === 0) {
    const initialEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@emperorsmartsolutions.com';
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Convoza2026!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(initialPassword, salt);

    await prisma.user.create({
      data: {
        email: initialEmail.toLowerCase().trim(),
        name: 'Emperor Smart Solutions Admin',
        passwordHash,
        isSuperAdmin: true,
        emailVerified: true,
      },
    });
    console.log(`Bootstrapped initial Super Admin: ${initialEmail}`);
  }

  console.log('CONVOZA core bootstrap completed cleanly (zero demo/mock data).');
}

main()
  .catch((e) => {
    console.error('Bootstrap error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
