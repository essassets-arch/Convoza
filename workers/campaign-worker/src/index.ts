import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decryptSecret, META_CONFIG, buildMetaMessagePayload } from '@convoza/configuration';

const prisma = new PrismaClient();
let isRunning = true;
let lastMaintenanceAt = 0;

async function getCategoryCostAndRate(org: any, category: string) {
  const settings = await prisma.systemSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const cat = String(category || 'MARKETING').toUpperCase();
  const metaPaise =
    cat === 'UTILITY'
      ? Number(map['META_COST_UTILITY_PAISE'] ?? 12)
      : cat === 'AUTHENTICATION'
      ? Number(map['META_COST_AUTH_PAISE'] ?? 12)
      : Number(map['META_COST_MARKETING_PAISE'] ?? 79);

  const sellPaise =
    cat === 'UTILITY'
      ? org.rateUtilityPaise ?? Number(map['DEFAULT_SELL_UTILITY_PAISE'] ?? 25)
      : cat === 'AUTHENTICATION'
      ? org.rateAuthPaise ?? Number(map['DEFAULT_SELL_AUTH_PAISE'] ?? 25)
      : org.rateMarketingPaise ?? Number(map['DEFAULT_SELL_MARKETING_PAISE'] ?? 99);

  return { cat, metaPaise, sellPaise };
}

async function processCampaignBatch(job: any) {
  const payload = job.payload as any;
  const campaignId = payload.campaignId;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      organization: true,
      template: true,
      phoneNumber: {
        include: {
          whatsappAccount: {
            include: { credentials: true },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  if (campaign.organization.isSuspended) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PAUSED' },
    });
    return;
  }

  if (campaign.status === 'PAUSED' || campaign.status === 'CANCELLED') {
    return;
  }

  const recipients = await prisma.campaignRecipient.findMany({
    where: {
      campaignId,
      status: 'QUEUED',
    },
    take: 40,
    include: { contact: true },
  });

  if (recipients.length === 0) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    return;
  }

  const encryptedToken = campaign.phoneNumber?.whatsappAccount?.credentials?.encryptedToken;
  const token = encryptedToken ? decryptSecret(encryptedToken) : '';
  const hasLiveMetaToken =
    Boolean(token) && !token.includes('placeholder') && !token.includes('MetaPermanentToken');

  if (!hasLiveMetaToken) {
    throw new Error('Cannot dispatch campaign without live Meta WABA System User credentials');
  }

  const { cat, metaPaise, sellPaise } = await getCategoryCostAndRate(
    campaign.organization,
    campaign.template.category
  );

  let batchSent = 0;
  let batchFailed = 0;
  let walletExhausted = false;

  // Process in chunks of 5 concurrent dispatches for 5x throughput without hot-row contention
  for (let i = 0; i < recipients.length; i += 5) {
    if (walletExhausted) break;
    const chunk = recipients.slice(i, i + 5);

    await Promise.all(
      chunk.map(async (r) => {
        if (walletExhausted) return;
        let chargedPaise = 0;

        try {
          if (campaign.organization.billingMode === 'PREPAID_WALLET' && sellPaise > 0) {
            const debited = await prisma.$transaction(async (tx) => {
              const curOrg = await tx.organization.findUnique({
                where: { id: campaign.organizationId },
                select: { walletBalancePaise: true },
              });
              if (!curOrg || curOrg.walletBalancePaise < sellPaise) {
                return false;
              }
              const nextBal = curOrg.walletBalancePaise - sellPaise;
              await tx.organization.update({
                where: { id: campaign.organizationId },
                data: { walletBalancePaise: nextBal },
              });
              await tx.walletTransaction.create({
                data: {
                  organizationId: campaign.organizationId,
                  type: 'DEBIT_MESSAGE',
                  amountPaise: sellPaise,
                  balanceAfterPaise: nextBal,
                  description: `Campaign "${campaign.name}" to ${r.contact.phone}`,
                  referenceId: campaign.id,
                },
              });
              return true;
            });

            if (!debited) {
              walletExhausted = true;
              return;
            }
            chargedPaise = sellPaise;
          }

          const conversation = await prisma.conversation.upsert({
            where: {
              organizationId_phoneNumberId_contactId: {
                organizationId: campaign.organizationId,
                phoneNumberId: campaign.phoneNumberId,
                contactId: r.contactId,
              },
            },
            create: {
              organizationId: campaign.organizationId,
              phoneNumberId: campaign.phoneNumberId,
              contactId: r.contactId,
              lastMessageAt: new Date(),
              lastMessagePreview: `Campaign: ${campaign.name}`,
            },
            update: {
              lastMessageAt: new Date(),
              lastMessagePreview: `Campaign: ${campaign.name}`,
            },
          });

          const varMap = (campaign.variableMapping as Record<string, string>) || {};
          const resolvedParams: Record<string, string> = {};
          for (const [key, val] of Object.entries(varMap)) {
            if (val === '{{contact.name}}') resolvedParams[key] = r.contact.name || 'Customer';
            else if (val === '{{contact.phone}}') resolvedParams[key] = r.contact.phone;
            else resolvedParams[key] = String(val);
          }

          const metaPayload = buildMetaMessagePayload({
            recipientPhone: r.contact.phone,
            type: 'TEMPLATE',
            templateName: campaign.template.name,
            templateLanguage: campaign.template.language,
            templateCategory: campaign.template.category,
            templateComponents: (campaign.template.components as any[]) || [],
            templateParameters: resolvedParams,
          });

          const metaRes = await axios.post(
            `${META_CONFIG.GRAPH_API_BASE}/${campaign.phoneNumberId}/messages`,
            metaPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              timeout: 12000,
            }
          );
          const wamid = metaRes.data?.messages?.[0]?.id;

          const message = await prisma.message.create({
            data: {
              organizationId: campaign.organizationId,
              phoneNumberId: campaign.phoneNumberId,
              contactId: r.contactId,
              conversationId: conversation.id,
              direction: 'OUTBOUND',
              type: 'TEMPLATE',
              status: 'SENT',
              wamid,
              body: `[Campaign: ${campaign.template.name}]`,
              templateId: campaign.templateId,
              templateParameters: resolvedParams,
              billingCategory: cat,
              isBillable: true,
              metaCostPaise: metaPaise,
              chargedPaise,
              sentAt: new Date(),
            },
          });

          await prisma.campaignRecipient.update({
            where: { id: r.id },
            data: { status: 'SENT', messageId: message.id },
          });

          batchSent += 1;
        } catch (err: any) {
          if (chargedPaise > 0) {
            await prisma.$transaction(async (tx) => {
              const upd = await tx.organization.update({
                where: { id: campaign.organizationId },
                data: { walletBalancePaise: { increment: chargedPaise } },
              });
              await tx.walletTransaction.create({
                data: {
                  organizationId: campaign.organizationId,
                  type: 'CREDIT_REFUND',
                  amountPaise: chargedPaise,
                  balanceAfterPaise: upd.walletBalancePaise,
                  description: `Auto-refund: Campaign message rejected for ${r.contact.phone}`,
                },
              });
            });
          }

          const errMsg = err.response?.data?.error?.message || err.message;
          await prisma.campaignRecipient.update({
            where: { id: r.id },
            data: { status: 'FAILED', errorMessage: errMsg },
          });
          batchFailed += 1;
        }
      })
    );
  }

  // Single aggregated counter update per batch
  const processedTotal = batchSent + batchFailed;
  if (processedTotal > 0) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        sentCount: { increment: batchSent },
        failedCount: { increment: batchFailed },
        queuedCount: { decrement: processedTotal },
      },
    });
  }

  if (walletExhausted) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PAUSED' },
    });
    return;
  }

  const remaining = await prisma.campaignRecipient.count({
    where: { campaignId, status: 'QUEUED' },
  });

  if (remaining > 0) {
    await prisma.outboxEvent.create({
      data: {
        organizationId: campaign.organizationId,
        type: 'PROCESS_CAMPAIGN_BATCH',
        payload: { campaignId },
        status: 'PENDING',
        scheduledFor: new Date(Date.now() + 400),
      },
    });
  } else {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }
}

async function runPeriodicMaintenance() {
  const now = Date.now();
  if (now - lastMaintenanceAt < 30_000) return;
  lastMaintenanceAt = now;

  // 1. Auto-recover zombie PROCESSING locks older than 2 minutes
  const staleCutoff = new Date(now - 120_000);
  await prisma.outboxEvent
    .updateMany({
      where: { status: 'PROCESSING', lockedAt: { lt: staleCutoff } },
      data: { status: 'PENDING', lockedAt: null, lockedBy: null },
    })
    .catch(() => {});

  // 2. Promote due SCHEDULED campaigns automatically
  const dueCampaigns = await prisma.campaign.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: new Date() },
      organization: { isSuspended: false },
    },
    take: 10,
  });

  for (const camp of dueCampaigns) {
    await prisma.$transaction([
      prisma.campaign.update({
        where: { id: camp.id },
        data: { status: 'PROCESSING', startedAt: new Date() },
      }),
      prisma.outboxEvent.create({
        data: {
          organizationId: camp.organizationId,
          type: 'PROCESS_CAMPAIGN_BATCH',
          payload: { campaignId: camp.id },
          status: 'PENDING',
        },
      }),
    ]);
  }
}

async function runCampaignWorker() {
  console.log('CONVOZA Campaign Worker started (high-throughput batch + scheduler)...');

  while (isRunning) {
    try {
      await runPeriodicMaintenance();

      const jobs: any[] = await prisma.$transaction(async (tx) => {
        const rows: any[] = await tx.$queryRaw`
          SELECT id, "organizationId", type, payload, attempts, "maxAttempts"
          FROM outbox_events
          WHERE status = 'PENDING'
            AND type = 'PROCESS_CAMPAIGN_BATCH'
            AND "scheduledFor" <= NOW()
          ORDER BY "scheduledFor" ASC
          LIMIT 5
          FOR UPDATE SKIP LOCKED
        `;

        if (rows.length === 0) return [];

        const ids = rows.map((r) => r.id);
        await tx.$executeRaw`
          UPDATE outbox_events
          SET status = 'PROCESSING', "lockedAt" = NOW(), "lockedBy" = 'campaign-worker'
          WHERE id = ANY(${ids}::text[])
        `;

        return rows;
      });

      if (jobs.length > 0) {
        for (const job of jobs) {
          try {
            await processCampaignBatch(job);
            await prisma.outboxEvent.update({
              where: { id: job.id },
              data: { status: 'COMPLETED' },
            });
          } catch (err: any) {
            const nextAttempt = job.attempts + 1;
            const isDeadLetter = nextAttempt >= (job.maxAttempts || 4);
            const backoffMs = Math.pow(2, nextAttempt) * 2000;
            await prisma.outboxEvent.update({
              where: { id: job.id },
              data: {
                attempts: nextAttempt,
                lastError: err.message,
                status: isDeadLetter ? 'DEAD_LETTER' : 'PENDING',
                scheduledFor: new Date(Date.now() + backoffMs),
              },
            });
          }
        }
      } else {
        await new Promise((res) => setTimeout(res, 6000));
      }
    } catch (err) {
      console.error('Campaign worker error:', err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  await prisma.$disconnect();
  console.log('Campaign Worker stopped gracefully.');
}

process.on('SIGTERM', () => { isRunning = false; });
process.on('SIGINT', () => { isRunning = false; });

runCampaignWorker();
