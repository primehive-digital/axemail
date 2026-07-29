import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import { Prisma, PrismaClient } from "@prisma/client";

const sourceUrl = process.env.OLD_DATABASE_URL?.trim();
const targetUrl = process.env.DATABASE_URL?.trim();

if (!sourceUrl) throw new Error("OLD_DATABASE_URL must point to the old Neon database.");
if (!targetUrl) throw new Error("DATABASE_URL must point to the new Neon database.");
if (sourceUrl === targetUrl) throw new Error("Source and target URLs must differ.");

const source = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: sourceUrl }),
});
const target = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: targetUrl }),
});

const tableNames = [
  "users", "SMTP mailers", "mailer policies", "reply-to options",
  "cooldown settings", "user limits", "delivery records", "templates",
] as const;

async function readCounts(client: PrismaClient) {
  return Promise.all([
    client.user.count(),
    client.smtpMailerAccount.count(),
    client.mailerPolicy.count(),
    client.mailerReplyToOption.count(),
    client.mailerCooldownSetting.count(),
    client.userMailerAllocation.count(),
    client.deliveryRecord.count(),
    client.emailTemplate.count(),
  ]);
}

async function main() {
  console.log("Checking source and target databases...");
  const [sourceCounts, targetCounts] = await Promise.all([
    readCounts(source),
    readCounts(target),
  ]);

  const occupied = targetCounts
    .map((count, index) => ({ count, name: tableNames[index] }))
    .filter(({ count }) => count > 0);
  if (occupied.length) {
    const summary = occupied.map(({ count, name }) => `${name}: ${count}`).join(", ");
    throw new Error(`Target is not empty (${summary}); nothing was written.`);
  }

  console.log(
    "Source records:",
    tableNames.map((name, index) => `${name}=${sourceCounts[index]}`).join(", "),
  );

  const [
    users, smtpMailerAccounts, mailerPolicies, replyToOptions,
    cooldownSettings, userLimits, deliveryRecords, templates,
  ] = await Promise.all([
    source.user.findMany(),
    source.smtpMailerAccount.findMany(),
    source.mailerPolicy.findMany(),
    source.mailerReplyToOption.findMany(),
    source.mailerCooldownSetting.findMany(),
    source.userMailerAllocation.findMany(),
    source.deliveryRecord.findMany(),
    source.emailTemplate.findMany(),
  ]);

  console.log("Writing retained data in one transaction...");
  const smtpMailerAccountRows = smtpMailerAccounts.map((row) => ({
    ...row,
    metadata:
      row.metadata === null
        ? Prisma.DbNull
        : (row.metadata as Prisma.InputJsonValue),
  }));
  const templateRows = templates.map((row) => ({
    ...row,
    fields:
      row.fields === null ? Prisma.JsonNull : (row.fields as Prisma.InputJsonValue),
    supportedMailers:
      row.supportedMailers === null
        ? Prisma.JsonNull
        : (row.supportedMailers as Prisma.InputJsonValue),
  }));

  await target.$transaction(async (database) => {
    if (users.length) await database.user.createMany({ data: users });
    if (smtpMailerAccountRows.length) {
      await database.smtpMailerAccount.createMany({ data: smtpMailerAccountRows });
    }
    if (mailerPolicies.length) await database.mailerPolicy.createMany({ data: mailerPolicies });
    if (replyToOptions.length) {
      await database.mailerReplyToOption.createMany({ data: replyToOptions });
    }
    if (cooldownSettings.length) {
      await database.mailerCooldownSetting.createMany({ data: cooldownSettings });
    }
    if (userLimits.length) {
      await database.userMailerAllocation.createMany({ data: userLimits });
    }
    if (deliveryRecords.length) {
      await database.deliveryRecord.createMany({ data: deliveryRecords });
    }
    if (templateRows.length) await database.emailTemplate.createMany({ data: templateRows });
  }, { maxWait: 10_000, timeout: 120_000 });

  const migratedCounts = await readCounts(target);
  const mismatches = sourceCounts
    .map((expected, index) => ({ expected, actual: migratedCounts[index], name: tableNames[index] }))
    .filter(({ expected, actual }) => expected !== actual);
  if (mismatches.length) {
    throw new Error(
      `Verification failed: ${mismatches
        .map(({ expected, actual, name }) => `${name} expected ${expected}, got ${actual}`)
        .join(", ")}`,
    );
  }

  console.log("Migration verified successfully.");
  console.log("Login sessions were not copied; every user must sign in again.");
  console.log("Password hashes and encrypted SMTP credentials were copied without displaying them.");
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const safeMessage = message
      .split(sourceUrl).join("[old-database-redacted]")
      .split(targetUrl).join("[new-database-redacted]");
    console.error(`Migration failed: ${safeMessage}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled([source.$disconnect(), target.$disconnect()]);
  });
