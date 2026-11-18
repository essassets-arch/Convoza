import { PrismaClient, UserRole, BillingPlanTier, SubscriptionStatus, QualityRating, MessagingTier, TemplateCategory, TemplateStatus, ConsentStatus, MessageDirection, MessageType, MessageStatus, ConversationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CONVOZA database...');

  // 1. Seed Billing Plans
  const starterPlan = await prisma.plan.upsert({
    where: { tier: BillingPlanTier.STARTER },
    create: {
      tier: BillingPlanTier.STARTER,
      name: 'Starter Plan',
      description: 'Essential WhatsApp automation for growing teams',
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

  const growthPlan = await prisma.plan.upsert({
    where: { tier: BillingPlanTier.GROWTH },
    create: {
      tier: BillingPlanTier.GROWTH,
      name: 'Growth Plan',
      description: 'High-throughput campaigns and shared inbox for scaled brands',
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

  const enterprisePlan = await prisma.plan.upsert({
    where: { tier: BillingPlanTier.ENTERPRISE },
    create: {
      tier: BillingPlanTier.ENTERPRISE,
      name: 'Enterprise Plan',
      description: 'Unlimited team seats, dedicated IP, custom SLA, and direct Meta priority line',
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

  // 2. Seed Super Admin
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@Convoza2026!', salt);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@convoza.io' },
    create: {
      email: 'admin@convoza.io',
      name: 'CONVOZA System Admin',
      passwordHash: adminPasswordHash,
      isSuperAdmin: true,
      emailVerified: true,
    },
    update: {
      isSuperAdmin: true,
    },
  });

  // 3. Seed Demo Organization and Owner
  const demoOwnerPasswordHash = await bcrypt.hash('Demo@Convoza2026!', salt);
  const demoOwner = await prisma.user.upsert({
    where: { email: 'alex@apexretail.com' },
    create: {
      email: 'alex@apexretail.com',
      name: 'Alex Vance',
      phone: '+919876543200',
      passwordHash: demoOwnerPasswordHash,
      emailVerified: true,
    },
    update: {},
  });

  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'apex-global-retail' },
    create: {
      name: 'Apex Global Retail',
      slug: 'apex-global-retail',
    },
    update: {},
  });

  // Membership
  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: demoOrg.id,
        userId: demoOwner.id,
      },
    },
    create: {
      organizationId: demoOrg.id,
      userId: demoOwner.id,
      role: UserRole.ORG_OWNER,
    },
    update: {},
  });

  // Active Subscription
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await prisma.subscription.upsert({
    where: { organizationId: demoOrg.id },
    create: {
      organizationId: demoOrg.id,
      planId: growthPlan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: oneYearFromNow,
    },
    update: {},
  });

  // 4. Seed WhatsApp Account & Verified Phone Number
  const whatsappAccount = await prisma.whatsAppAccount.upsert({
    where: {
      organizationId_wabaId: {
        organizationId: demoOrg.id,
        wabaId: '109823746591029',
      },
    },
    create: {
      organizationId: demoOrg.id,
      wabaId: '109823746591029',
      name: 'Apex Official WhatsApp',
      status: 'CONNECTED',
      webhookSubscribed: true,
    },
    update: {},
  });

  const phoneNumber = await prisma.phoneNumber.upsert({
    where: { phoneNumberId: '102938475610293' },
    create: {
      organizationId: demoOrg.id,
      whatsappAccountId: whatsappAccount.id,
      phoneNumberId: '102938475610293',
      displayPhoneNumber: '+91 98765 43210',
      verifiedName: 'Apex Retail Official',
      qualityRating: QualityRating.GREEN,
      messagingLimitTier: MessagingTier.TIER_10K,
      isDefault: true,
    },
    update: {},
  });

  // 5. Seed Approved Message Templates
  const template1 = await prisma.template.upsert({
    where: {
      organizationId_name_language: {
        organizationId: demoOrg.id,
        name: 'order_confirmation_v1',
        language: 'en_US',
      },
    },
    create: {
      organizationId: demoOrg.id,
      whatsappAccountId: whatsappAccount.id,
      name: 'order_confirmation_v1',
      language: 'en_US',
      category: TemplateCategory.UTILITY,
      status: TemplateStatus.APPROVED,
      metaTemplateId: 'meta_tpl_991823',
      components: [
        { type: 'HEADER', format: 'TEXT', text: 'Order Confirmation #{{1}}' },
        {
          type: 'BODY',
          text: 'Hi {{1}}, thank you for shopping with Apex Retail! Your order for {{2}} items has been confirmed and is being prepared for dispatch.',
        },
        { type: 'FOOTER', text: 'Apex Global Retail • High-performance shopping' },
        {
          type: 'BUTTONS',
          buttons: [
            { type: 'URL', text: 'Track Order', url: 'https://apexretail.com/track/{{1}}' },
            { type: 'QUICK_REPLY', text: 'Speak to Support' },
          ],
        },
      ],
    },
    update: {},
  });

  const template2 = await prisma.template.upsert({
    where: {
      organizationId_name_language: {
        organizationId: demoOrg.id,
        name: 'weekend_vip_flash_sale',
        language: 'en_US',
      },
    },
    create: {
      organizationId: demoOrg.id,
      whatsappAccountId: whatsappAccount.id,
      name: 'weekend_vip_flash_sale',
      language: 'en_US',
      category: TemplateCategory.MARKETING,
      status: TemplateStatus.APPROVED,
      metaTemplateId: 'meta_tpl_991824',
      components: [
        { type: 'HEADER', format: 'TEXT', text: 'Flash Sale: 40% OFF Weekend Deal' },
        {
          type: 'BODY',
          text: 'Hey {{1}}, enjoy exclusive early access to our VIP Flash Sale! Use coupon code {{2}} at checkout for flat 40% off across all categories.',
        },
        { type: 'FOOTER', text: 'Reply STOP to opt out' },
        {
          type: 'BUTTONS',
          buttons: [
            { type: 'URL', text: 'Claim Offer', url: 'https://apexretail.com/vip' },
            { type: 'QUICK_REPLY', text: 'Ask Question' },
          ],
        },
      ],
    },
    update: {},
  });

  // 6. Seed Demo Contacts & Tags
  const vipTag = await prisma.tag.upsert({
    where: { organizationId_name: { organizationId: demoOrg.id, name: 'VIP Customer' } },
    create: { organizationId: demoOrg.id, name: 'VIP Customer', color: '#10B981' },
    update: {},
  });

  const highValueTag = await prisma.tag.upsert({
    where: { organizationId_name: { organizationId: demoOrg.id, name: 'High Value' } },
    create: { organizationId: demoOrg.id, name: 'High Value', color: '#3B82F6' },
    update: {},
  });

  const demoContactsData = [
    { name: 'Sarah Miller', phone: '+919876540001', email: 'sarah.m@example.com' },
    { name: 'Rohan Sharma', phone: '+919876540002', email: 'rohan.s@example.com' },
    { name: 'Elena Rostova', phone: '+919876540003', email: 'elena.r@example.com' },
    { name: 'Marcus Chen', phone: '+919876540004', email: 'marcus.c@example.com' },
    { name: 'Priya Patel', phone: '+919876540005', email: 'priya.p@example.com' },
  ];

  for (const cData of demoContactsData) {
    const contact = await prisma.contact.upsert({
      where: {
        organizationId_phone: {
          organizationId: demoOrg.id,
          phone: cData.phone,
        },
      },
      create: {
        organizationId: demoOrg.id,
        phone: cData.phone,
        name: cData.name,
        email: cData.email,
        consentStatus: ConsentStatus.OPTED_IN,
      },
      update: {},
    });

    await prisma.contactTag.upsert({
      where: {
        contactId_tagId: {
          contactId: contact.id,
          tagId: vipTag.id,
        },
      },
      create: {
        contactId: contact.id,
        tagId: vipTag.id,
      },
      update: {},
    });

    // Seed conversations & messages for Sarah and Rohan
    if (cData.name === 'Sarah Miller') {
      const activeWindow = new Date(Date.now() + 18 * 60 * 60 * 1000); // 18 hours remaining
      const conv = await prisma.conversation.upsert({
        where: {
          organizationId_phoneNumberId_contactId: {
            organizationId: demoOrg.id,
            phoneNumberId: phoneNumber.phoneNumberId,
            contactId: contact.id,
          },
        },
        create: {
          organizationId: demoOrg.id,
          phoneNumberId: phoneNumber.phoneNumberId,
          contactId: contact.id,
          status: ConversationStatus.OPEN,
          unreadCount: 1,
          lastMessageAt: new Date(),
          lastMessagePreview: 'Could you confirm when order #APX-4912 will be delivered?',
          customerWindowExpiresAt: activeWindow,
          assignedToUserId: demoOwner.id,
        },
        update: {},
      });

      const existingMessagesCount = await prisma.message.count({
        where: { conversationId: conv.id },
      });

      if (existingMessagesCount === 0) {
        await prisma.message.create({
          data: {
            organizationId: demoOrg.id,
            phoneNumberId: phoneNumber.phoneNumberId,
            contactId: contact.id,
            conversationId: conv.id,
            direction: MessageDirection.INBOUND,
            type: MessageType.TEXT,
            status: MessageStatus.DELIVERED,
            wamid: `wamid_inbound_${crypto.randomBytes(6).toString('hex')}`,
            body: 'Could you confirm when order #APX-4912 will be delivered?',
          },
        });

        await prisma.internalNote.create({
          data: {
            conversationId: conv.id,
            userId: demoOwner.id,
            content: 'Checked tracking portal. Carrier ETA is tomorrow morning.',
          },
        });
      }
    }
  }

  // 7. Seed Demo Campaign (idempotent)
  const existingCampaigns = await prisma.campaign.count({
    where: { organizationId: demoOrg.id },
  });

  if (existingCampaigns === 0) {
    await prisma.campaign.create({
      data: {
        organizationId: demoOrg.id,
        phoneNumberId: phoneNumber.phoneNumberId,
        templateId: template2.id,
        name: 'Weekend VIP Flash Sale Announcement',
        status: 'COMPLETED',
        totalRecipients: 500,
        sentCount: 500,
        deliveredCount: 489,
        readCount: 412,
        failedCount: 11,
        repliedCount: 84,
        startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
      },
    });
  }

  console.log('CONVOZA database seeded successfully!');
  console.log('Super Admin Login: admin@convoza.io / Admin@Convoza2026!');
  console.log('Demo Customer Login: alex@apexretail.com / Demo@Convoza2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

