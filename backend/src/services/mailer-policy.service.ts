import { MailerType } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/app-error";
import { mapMailerType } from "@/utils/enum-mappers";

export async function listMailerPolicies() {
  const policies = await prisma.mailerPolicy.findMany({
    orderBy: { mailerType: "asc" },
  });

  return policies.map((policy) => ({
    id: policy.id,
    mailerType: mapMailerType(policy.mailerType),
    dailyLimit: policy.dailyLimit,
  }));
}

export async function updateMailerPolicy(
  mailerType: MailerType,
  dailyLimit: number,
) {
  const policy = await prisma.mailerPolicy.upsert({
    where: { mailerType },
    create: {
      mailerType,
      dailyLimit,
    },
    update: {
      dailyLimit,
    },
  });

  await prisma.smtpMailerAccount.updateMany({
    where: { type: mailerType },
    data: { dailyLimit },
  });

  return {
    id: policy.id,
    mailerType: mapMailerType(policy.mailerType),
    dailyLimit: policy.dailyLimit,
  };
}
