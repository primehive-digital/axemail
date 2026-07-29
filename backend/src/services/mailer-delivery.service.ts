import crypto from "node:crypto";

import { DeliveryStatus, Prisma, MailerType } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { buildEmailHeaders, buildEnvelope } from "@/services/email-composer.service";
import { resolveUserContext } from "@/services/context.service";
import { dispatchMessage } from "@/services/mailer-dispatch.service";
import { getMaskServerHealth } from "@/services/mask-server.service";
import { assertReplyToAllowed, getMailerCooldownSchedule } from "@/services/mailer-customization.service";
import { cleanupExpiredDeliveryRecordsOncePerDay } from "@/services/report-retention.service";
import type { MailerComposerPayload } from "@/types/mailer.types";
import { AppError } from "@/utils/app-error";
import { startOfTodayUtc } from "@/utils/date";

const reservedDeliveryStatuses = [
  DeliveryStatus.QUEUED,
  DeliveryStatus.SENT,
] as const;

export async function sendComposerCampaign(input: MailerComposerPayload) {
  void cleanupExpiredDeliveryRecordsOncePerDay().catch((error) => {
    console.error("Delivery retention cleanup failed.", error);
  });
  const user = await resolveUserContext({ role: input.role, userId: input.userId });
  await assertReplyToAllowed({ mailerType: input.mailerType.toUpperCase() as MailerType, replyTo: input.replyTo });
  const deliveryId = crypto.randomUUID();

  const reservedDelivery = await retrySerializable(async () => {
    return prisma.$transaction(async (transaction) => {
      return reserveDelivery(transaction, {
        deliveryId,
        userId: user.id,
        mailerType: input.mailerType,
        to: input.to,
        bypassUserQuota: Boolean(input.bypassUserQuota),
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  });

  return processDelivery({
    deliveryId: reservedDelivery.id,
    recipientCount: reservedDelivery.recipientCount,
    userId: user.id,
    mailerType: input.mailerType.toUpperCase() as MailerType,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
    replyTo: input.replyTo,
    cc: splitAddresses(input.cc),
    bcc: splitAddresses(input.bcc),
    subject: input.subject,
    previewText: input.previewText,
    html: input.content,
    attachments: input.attachments ?? [],
  });
}

async function processDelivery(input: {
  deliveryId: string;
  recipientCount: number;
  userId: string;
  mailerType: MailerType;
  fromName: string;
  fromEmail?: string;
  replyTo: string;
  cc: string[];
  bcc: string[];
  subject: string;
  previewText?: string;
  html: string;
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    contentBase64: string;
  }>;
}) {
  const deliveries = await prisma.deliveryRecord.findMany({
    where: {
      deliveryId: input.deliveryId,
      status: DeliveryStatus.QUEUED,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!deliveries.length) {
    throw new AppError("Delivery is not available for processing.", 409);
  }

  let sentCount = 0;
  let failedCount = 0;

  for (let index = 0; index < deliveries.length; index += 1) {
    const delivery = deliveries[index];
    const isMaskSender = input.mailerType === MailerType.MASK;

    if (!isMaskSender && !delivery.smtpMailerAccountId) {
      await prisma.deliveryRecord.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.FAILED,
          errorMessage: "Reserved SMTP mailer account is missing.",
        },
      });
      failedCount += 1;
      continue;
    }

    const assignedAccount = delivery.smtpMailerAccountId
      ? await prisma.smtpMailerAccount.findUnique({
          where: { id: delivery.smtpMailerAccountId },
        })
      : null;

    if (
      !isMaskSender &&
      (!assignedAccount ||
        assignedAccount.status !== "ACTIVE" ||
        assignedAccount.healthStatus !== "ACTIVE")
    ) {
      await prisma.deliveryRecord.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.FAILED,
          errorMessage: "Reserved SMTP mailer account is not available.",
        },
      });
      failedCount += 1;
      continue;
    }

    const fromEmail =
      input.mailerType === MailerType.MASK
        ? input.fromEmail ?? ""
        : assignedAccount!.email;

    const headers = buildEmailHeaders({
      deliveryId: input.deliveryId,
      deliveryRecordId: delivery.id,
      mailerType: input.mailerType.toLowerCase(),
      previewText: input.previewText,
    });

    const dispatchPayload = {
      provider: assignedAccount?.provider ?? "mask-vps",
      smtpMailerAccountId: assignedAccount?.id ?? "mask-server",
      fromEmail,
      fromName: input.fromName,
      to: delivery.recipientEmail,
      cc: input.cc,
      bcc: input.bcc,
      replyTo: input.replyTo,
      subject: input.subject,
      previewText: input.previewText,
      html: input.html,
      attachments: input.attachments,
      headers,
      envelope: buildEnvelope({
        provider: assignedAccount?.provider ?? "mask-vps",
        smtpMailerAccountId: assignedAccount?.id ?? "mask-server",
        fromEmail,
        fromName: input.fromName,
        to: delivery.recipientEmail,
        cc: input.cc,
        bcc: input.bcc,
        replyTo: input.replyTo,
        subject: input.subject,
        previewText: input.previewText,
        html: input.html,
        attachments: input.attachments,
        headers,
        envelope: { from: fromEmail, to: [] },
        metadata: {
          deliveryId: input.deliveryId,
          deliveryRecordId: delivery.id,
          userId: input.userId,
        },
      }),
      metadata: {
        deliveryId: input.deliveryId,
        deliveryRecordId: delivery.id,
        userId: input.userId,
      },
    };

    try {
      const result = await dispatchMessage(
        input.mailerType,
        assignedAccount ?? {
          email: fromEmail,
          provider: "mask-vps",
        },
        dispatchPayload,
      );

      await prisma.deliveryRecord.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.SENT,
          providerMessageId: result.providerMessageId,
          messageIdHeader: headers["Message-ID"],
          sentAt: new Date(),
        },
      });

      sentCount += 1;
    } catch (error) {
      console.error("Dispatch failed.", {
        deliveryId: input.deliveryId,
        deliveryRecordId: delivery.id,
        error,
      });

      await prisma.deliveryRecord.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.FAILED,
          messageIdHeader: headers["Message-ID"],
          errorMessage: error instanceof Error ? error.message : "Dispatch failed.",
        },
      });

      failedCount += 1;
    }

    if (
      (input.mailerType === MailerType.DOMAIN || input.mailerType === MailerType.GMAIL) &&
      index < deliveries.length - 1
    ) {
      await sleep((await getCooldownSeconds(input.mailerType)) * 1000);
    }
  }

  const finalStatus =
    failedCount === 0
      ? "completed"
      : sentCount === 0
        ? "failed"
        : "partial";

  return {
    id: input.deliveryId,
    status: finalStatus,
    recipientCount: input.recipientCount,
  };
}

async function reserveDelivery(
  transaction: Prisma.TransactionClient,
  input: {
    deliveryId: string;
    userId: string;
    mailerType: "gmail" | "domain" | "mask";
    to: string;
    bypassUserQuota?: boolean;
  },
) {
  const mailerType = input.mailerType.toUpperCase() as MailerType;
  const recipients = splitAddresses(input.to);

  if (!recipients.length) {
    throw new AppError("At least one recipient is required.", 400);
  }

  if (!input.bypassUserQuota) {
    const allocation = await transaction.userMailerAllocation.findUnique({
      where: {
        userId_mailerType: {
          userId: input.userId,
          mailerType,
        },
      },
    });

    const assignedLimit = allocation?.assignedLimit ?? 0;

    const reservedForUser = await transaction.deliveryRecord.count({
      where: {
        userId: input.userId,
        mailerType,
        createdAt: { gte: startOfTodayUtc() },
        status: { in: reservedDeliveryStatuses as unknown as DeliveryStatus[] },
      },
    });

    const remainingQuota = Math.max(assignedLimit - reservedForUser, 0);

    if (remainingQuota < recipients.length) {
      throw new AppError("Assigned mailer quota exceeded.", 409, {
        remaining: remainingQuota,
      });
    }
  }

  const accountAssignments = await reserveSmtpMailerAccounts(transaction, mailerType, recipients.length);

  await transaction.deliveryRecord.createMany({
    data: recipients.map((recipientEmail, index) => ({
      deliveryId: input.deliveryId,
      userId: input.userId,
      mailerType,
      recipientEmail,
      smtpMailerAccountId: accountAssignments[index]?.id ?? null,
      status: DeliveryStatus.QUEUED,
    })),
  });

  return {
    id: input.deliveryId,
    recipientCount: recipients.length,
  };
}

async function reserveSmtpMailerAccounts(
  transaction: Prisma.TransactionClient,
  mailerType: MailerType,
  recipientCount: number,
) {
  if (mailerType === MailerType.MASK) {
    const health = await getMaskServerHealth();

    if (health.status !== "active") {
      throw new AppError("Mask server is not working.", 409);
    }

    const policy = await transaction.mailerPolicy.findUnique({
      where: { mailerType: MailerType.MASK },
    });

    const dailyLimit = policy?.dailyLimit ?? 2000;
    const usedToday = await transaction.deliveryRecord.count({
      where: {
        mailerType: MailerType.MASK,
        createdAt: { gte: startOfTodayUtc() },
        status: { in: reservedDeliveryStatuses as unknown as DeliveryStatus[] },
      },
    });

    const remaining = Math.max(dailyLimit - usedToday, 0);

    if (remaining < recipientCount) {
      throw new AppError("Provider daily capacity exceeded.", 409, {
        totalAvailable: remaining,
        requested: recipientCount,
      });
    }

    return Array.from({ length: recipientCount }, () => null);
  }

  const accounts = await transaction.smtpMailerAccount.findMany({
    where: { type: mailerType, status: "ACTIVE", healthStatus: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });

  if (!accounts.length) {
    throw new AppError("No active SMTP mailer accounts available.", 409);
  }

  const usageRows = await transaction.deliveryRecord.groupBy({
    by: ["smtpMailerAccountId"],
    _count: { _all: true },
    where: {
      smtpMailerAccountId: { in: accounts.map((account) => account.id) },
      createdAt: { gte: startOfTodayUtc() },
      status: { in: reservedDeliveryStatuses as unknown as DeliveryStatus[] },
    },
  });

  const usageMap = new Map(usageRows.map((row) => [row.smtpMailerAccountId ?? "", row._count._all]));

  const eligible = accounts
    .map((account) => ({
      ...account,
      usedToday: usageMap.get(account.id) ?? 0,
      remaining: Math.max(account.dailyLimit - (usageMap.get(account.id) ?? 0), 0),
    }))
    .filter((account) => account.remaining > 0)
    .sort((left, right) => left.usedToday - right.usedToday);

  const totalAvailable = eligible.reduce((total, account) => total + account.remaining, 0);

  if (totalAvailable < recipientCount) {
    throw new AppError("Provider daily capacity exceeded.", 409, {
      totalAvailable,
      requested: recipientCount,
    });
  }

  const assignments: typeof eligible = [];
  let cursor = 0;

  while (assignments.length < recipientCount) {
    const account = eligible[cursor % eligible.length];
    if (account.remaining > 0) {
      assignments.push(account);
      account.remaining -= 1;
    }
    cursor += 1;
  }

  return assignments;
}

async function retrySerializable<T>(callback: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await callback();
    } catch (error) {
      attempt += 1;

      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2034" ||
        attempt >= maxAttempts
      ) {
        throw error;
      }
    }
  }

  throw new AppError("Reservation retry limit exceeded.", 409);
}

function splitAddresses(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getCooldownSeconds(mailerType: MailerType) {
  const weights = [...(await getMailerCooldownSchedule(mailerType))];
  if (weights.length === 5) {
    weights.unshift(20, 35, 50, 70);
  }
  return weights[Math.floor(Math.random() * weights.length)] ?? 20;
}

function sleep(timeoutMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
}





