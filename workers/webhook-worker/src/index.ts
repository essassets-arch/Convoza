import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let isRunning = true;

async function processWebhookJob(job: any) {
  const payload = job.payload as any;
  if (payload?.eventType === 'DELIVERY_STATUS' && payload.wamid) {
    const status = payload.status;
    const message = await prisma.message.findUnique({
      where: { wamid: payload.wamid },
    });

    if (message) {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status,
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'READ' && { readAt: new Date() }),
        },
      });
    }
  }
}

async function runWebhookWorker() {
  console.log('CONVOZA Webhook Reconciliation Worker started...');

  while (isRunning) {
    try {
      const jobs: any[] = await prisma.$transaction(async (tx) => {
        const rows: any[] = await tx.$queryRaw`
          SELECT id, "organizationId", type, payload, attempts, "maxAttempts"
          FROM outbox_events
          WHERE status = 'PENDING'
            AND type = 'PROCESS_WEBHOOK_EVENT'
            AND "scheduledFor" <= NOW()
          ORDER BY "scheduledFor" ASC
          LIMIT 20
          FOR UPDATE SKIP LOCKED
        `;

        if (rows.length === 0) return [];

        const ids = rows.map((r) => r.id);
        await tx.$executeRaw`
          UPDATE outbox_events
          SET status = 'PROCESSING', "lockedAt" = NOW(), "lockedBy" = 'webhook-worker'
          WHERE id = ANY(${ids}::text[])
        `;

        return rows;
      });

      if (jobs.length > 0) {
        for (const job of jobs) {
          try {
            await processWebhookJob(job);
            await prisma.outboxEvent.update({
              where: { id: job.id },
              data: { status: 'COMPLETED' },
            });
          } catch (err: any) {
            const nextAttempt = job.attempts + 1;
            await prisma.outboxEvent.update({
              where: { id: job.id },
              data: {
                attempts: nextAttempt,
                lastError: err.message,
                status: nextAttempt >= 5 ? 'DEAD_LETTER' : 'PENDING',
                scheduledFor: new Date(Date.now() + Math.pow(2, nextAttempt) * 2000),
              },
            });
          }
        }
      } else {
        await new Promise((res) => setTimeout(res, 10000));
      }
    } catch (err) {
      console.error('Webhook worker error:', err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  await prisma.$disconnect();
  console.log('Webhook Worker stopped gracefully.');
}

process.on('SIGTERM', () => { isRunning = false; });
process.on('SIGINT', () => { isRunning = false; });

runWebhookWorker();
