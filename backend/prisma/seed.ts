import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import argon2 from "argon2";
import { MailerType, PrismaClient, Role, UserStatus } from "@prisma/client";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminPasswordHash = await argon2.hash("admin1234", {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  await prisma.userSession.deleteMany();
  await prisma.deliveryRecord.deleteMany();
  await prisma.userMailerAllocation.deleteMany();
  await prisma.smtpMailerAccount.deleteMany();
  await prisma.mailerPolicy.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Authority",
      pseudoName: "Control Master",
      email: "admin@axemail.cloud",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.mailerPolicy.createMany({
    data: [
      { mailerType: MailerType.GMAIL, dailyLimit: 150 },
      { mailerType: MailerType.DOMAIN, dailyLimit: 200 },
      { mailerType: MailerType.MASK, dailyLimit: 2000 },
    ],
  });

  await prisma.emailTemplate.create({
    data: {
      key: "template-01",
      name: "Template 01",
      description: "Default outreach template.",
      fields: [
        { key: "campaignName", label: "Campaign Name", required: true },
        { key: "referenceCode", label: "Reference Code", required: false },
        { key: "notes", label: "Notes", required: false },
      ],
      contentHtml: null,
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });