import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decryptSecret, META_CONFIG, WORKER_CONFIG, buildMetaMessagePayload } from '@convoza/configuration';

const prisma = new PrismaClient();
let isRunning = true;

async function processCampaignBatch(job: any) {
  const payload = job.payload as any;
  const campaignId = payload.campaignId;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
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

  // Check if paused or cancelled
  if (campaign.status === 'PAUSED' || campaign.status === 'CANCELLED') {
    return;
  }

  // Fetch next batch of QUEUED recipients
  const recipients = await prisma.campaignRecipient.findMany({
    where: {
      campaignId,
      status: 'QUEUED',
    },
    take: 50,
    include: { contact: true },
  });

  if (recipients.length === 0) {
    // All recipients processed - mark campaign COMPLETED
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    return;
  }

  const encryptedToken = campaign.phoneNumber?.whatsappAccount?.credentials?.encryptedToken;
  const token = encryptedToken ? decryptSecret(encryptedToken) : '';
  const hasLiveMetaToken =
    Boolean(token) && !token.includes('placeholder') && !token.includes('MetaPermanentToken');

  // Process batch
  for (const r of recipients) {
    try {
      // Ensure valid conversation exists for foreign key integrity
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

      let wamid = `wamid_camp_${campaign.id}_${r.id}_${Date.now()}`;
      if (hasLiveMetaToken) {
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
            timeout: 10000,
          }
        );
        wamid = metaRes.data?.messages?.[0]?.id || wamid;
      }

      // Create message record
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
          sentAt: new Date(),
        },
      });

      // Update recipient status
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: {
          status: 'SENT',
          messageId: message.id,
        },
      });

      // Increment campaign counters
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          sentCount: { increment: 1 },
          queuedCount: { decrement: 1 },
        },
      });
    } catch (err: any) {
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: {
          status: 'FAILED',
          errorMessage: err.message,
        },
      });

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          failedCount: { increment: 1 },
          queuedCount: { decrement: 1 },
        },
      });
    }
  }

  // Check if more recipients remain
  const remaining = await prisma.campaignRecipient.count({
    where: { campaignId, status: 'QUEUED' },
  });

  if (remaining > 0) {
    // Re-enqueue next batch
    await prisma.outboxEvent.create({
      data: {
        organizationId: campaign.organizationId,
        type: 'PROCESS_CAMPAIGN_BATCH',
        payload: { campaignId },
        status: 'PENDING',
        scheduledFor: new Date(Date.now() + 500),
      },
    });
  } else {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}

async function runCampaignWorker() {
  console.log('CONVOZA Campaign Worker started (batch processor)...');

  while (isRunning) {
    try {
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
          SET status = 'PROCESSING', "lockedAt" = NOW()
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
            console.error(`Campaign batch failed: ${err.message}`);
            await prisma.outboxEvent.update({
              where: { id: job.id },
              data: {
                attempts: job.attempts + 1,
                lastError: err.message,
                status: job.attempts >= 3 ? 'FAILED' : 'PENDING',
              },
            });
          }
        }
      } else {
        await new Promise((res) => setTimeout(res, WORKER_CONFIG.POLL_INTERVAL_MS));
      }
    } catch (err) {
      console.error('Campaign worker error:', err);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  await prisma.$disconnect();
  console.log('Campaign Worker stopped gracefully.');
}

process.on('SIGTERM', () => { isRunning = false; });
process.on('SIGINT', () => { isRunning = false; });

runCampaignWorker();

