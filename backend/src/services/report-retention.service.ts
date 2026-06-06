import { prisma } from "@/config/prisma";

let cleanupPromise: Promise<number> | null = null;

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

export function startReportRetentionSchedule() {
  void cleanupExpiredDeliveryRecords().catch((error) => {
    console.error("Report retention cleanup failed.", error);
  });

  return setInterval(() => {
    void cleanupExpiredDeliveryRecords().catch((error) => {
      console.error("Report retention cleanup failed.", error);
    });
  }, 24 * 60 * 60 * 1000);
}

function getRetentionCutoff(now: Date) {
  const monthOffset = now.getUTCDate() <= 7 ? -1 : 0;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1));
}

export function getReportRetentionCutoff(now = new Date()) {
  return getRetentionCutoff(now);
}
