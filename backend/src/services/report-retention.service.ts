import { prisma } from "@/config/prisma";

let cleanupPromise: Promise<number> | null = null;
let lastDailyCleanupKey: string | null = null;

export async function cleanupExpiredDeliveryRecords() {
  if (!cleanupPromise) {
    const now = new Date();
    const cutoff = getRetentionCutoff(now);

    cleanupPromise = prisma.deliveryRecord
      .deleteMany({
        where: {
          createdAt: { lt: cutoff },
          OR: [{ sentAt: null }, { sentAt: { lt: cutoff } }],
        },
      })
      .then((result) => result.count)
      .finally(() => {
        cleanupPromise = null;
      });
  }

  return cleanupPromise;
}

export async function cleanupExpiredDeliveryRecordsOncePerDay(now = new Date()) {
  const cleanupKey = now.toISOString().slice(0, 10);

  if (lastDailyCleanupKey === cleanupKey) {
    return 0;
  }

  const deleted = await cleanupExpiredDeliveryRecords();
  lastDailyCleanupKey = cleanupKey;
  return deleted;
}

function getRetentionCutoff(now: Date) {
  const monthOffset = now.getUTCDate() <= 7 ? -1 : 0;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1));
}

export function getReportRetentionCutoff(now = new Date()) {
  return getRetentionCutoff(now);
}
