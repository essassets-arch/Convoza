import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { decryptSecret, META_CONFIG, WORKER_CONFIG, buildMetaMessagePayload } from '@convoza/configuration';

const prisma = new PrismaClient();
let isRunning = true;

async function processMessageJob(job: any) {
  const payload = job.payload as any;
  const messageId = payload.messageId;
  const phoneNumberId = payload.phoneNumberId;
  let recipientPhone = payload.recipientPhone;

  // Retrieve phone number and credentials
  const phone = await prisma.phoneNumber.findUnique({
    where: { phoneNumberId },
    include: {
      whatsappAccount: {
        include: { credentials: true },
      },
    },
  });

  if (!phone || !phone.whatsappAccount) {
    throw new Error(`Phone number ${phoneNumberId} not found`);
  }

  if (!recipientPhone && messageId) {
    const existingMsg = await prisma.message.findUnique({
      where: { id: messageId },
      include: { contact: true },
    });
    recipientPhone = existingMsg?.contact?.phone || '';
  }

  const token = phone.whatsappAccount.credentials?.encryptedToken
    ? decryptSecret(phone.whatsappAccount.credentials.encryptedToken)
    : '';

  const metaPayload = buildMetaMessagePayload({
    recipientPhone,
    type: payload.type,
    body: payload.body,
    mediaUrl: payload.mediaUrl,
    templateName: payload.templateName,
    templateLanguage: payload.templateLanguage,
    templateCategory: payload.templateCategory,
    templateComponents: payload.templateComponents || [],
    templateParameters: payload.templateParameters || null,
  });

  let wamid = `wamid_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // In production with live Meta token, send via Meta Graph API
  if (token && !token.includes('placeholder') && !token.includes('MetaPermanentToken')) {
    try {
      const response = await axios.post(
        `${META_CONFIG.GRAPH_API_BASE}/${phoneNumberId}/messages`,
        metaPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      wamid = response.data?.messages?.[0]?.id || wamid;
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.error_user_msg || err.response?.data?.error?.message || err.message;
      throw new Error(`Meta API error: ${errMsg}`);
    }
  }

  // Update message record
  await prisma.message.update({
    where: { id: messageId },
    data: {
      status: 'SENT',
      wamid,
      sentAt: new Date(),
    },
  });

  // Record status event
  await prisma.messageStatusEvent.create({
    data: {
      messageId,
      status: 'SENT',
      timestamp: new Date(),
    },
  });
}

async function runWorkerLoop() {
  console.log('CONVOZA Message Worker started (PostgreSQL transactional queue)...');

  while (isRunning) {
    try {
      // Transactional claim using FOR UPDATE SKIP LOCKED
      const jobsToProcess = await prisma.$transaction(async (tx) => {
        const rows: any[] = await tx.$queryRaw`
          SELECT id, "organizationId", type, payload, attempts, "maxAttempts"
          FROM outbox_events
          WHERE status = 'PENDING'
            AND type = 'SEND_INDIVIDUAL_MESSAGE'
            AND "scheduledFor" <= NOW()
          ORDER BY "scheduledFor" ASC
          LIMIT 10
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

      if (jobsToProcess.length > 0) {
        for (const job of jobsToProcess) {
          try {
            await processMessageJob(job);
            await prisma.outboxEvent.update({
              where: { id: job.id },
              data: { status: 'COMPLETED' },
            });
          } catch (err: any) {
            const nextAttempt = job.attempts + 1;
            const isDeadLetter = nextAttempt >= job.maxAttempts;
            const backoffSeconds = Math.pow(2, nextAttempt) * 2;
            const nextScheduled = new Date(Date.now() + backoffSeconds * 1000);

            await prisma.outboxEvent.update({
              where: { id: job.id },
              data: {
                attempts: nextAttempt,
                lastError: err.message,
                status: isDeadLetter ? 'DEAD_LETTER' : 'PENDING',
                scheduledFor: nextScheduled,
              },
            });

            // Mark message failed if dead lettered
            if (isDeadLetter && job.payload?.messageId) {
              await prisma.message.update({
                where: { id: job.payload.messageId },
                data: {
                  status: 'FAILED',
                  errorMessage: err.message,
                },
              }).catch(() => {});
            }
          }
        }
      } else {
        await new Promise((res) => setTimeout(res, WORKER_CONFIG.POLL_INTERVAL_MS));
      }
    } catch (loopErr) {
      console.error('Worker loop error:', loopErr);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  await prisma.$disconnect();
  console.log('Message Worker stopped gracefully.');
}

process.on('SIGTERM', () => { isRunning = false; });
process.on('SIGINT', () => { isRunning = false; });

runWorkerLoop();

