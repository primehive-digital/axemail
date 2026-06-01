import type { Server } from "node:http";

import { env } from "@/config/env";
import { prisma } from "@/config/prisma";
import { startReportRetentionSchedule } from "@/services/report-retention.service";

let server: Server;
let reportRetentionTimer: NodeJS.Timeout | undefined;

async function shutdown(signal: string) {
  console.log(`Shutting down backend. Signal: ${signal}`);
  if (reportRetentionTimer) {
    clearInterval(reportRetentionTimer);
  }
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

async function bootstrap() {
  await prisma.$connect();
  console.log("Prisma connected.");

  const { createApp } = await import("@/app");
  const app = createApp();
  reportRetentionTimer = startReportRetentionSchedule();
  server = app.listen(env.PORT, () => {
    console.log(`Axemail backend listening on port ${env.PORT}.`);
  });

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

void bootstrap().catch(async (error) => {
  console.error("Backend bootstrap failed.", error);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
