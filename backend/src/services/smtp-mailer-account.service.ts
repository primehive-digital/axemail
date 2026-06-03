import nodemailer from "nodemailer";
import {
  SmtpMailerAccountStatus,
  SmtpMailerHealthStatus,
  MailerType,
} from "@prisma/client";

import { prisma } from "@/config/prisma";
import { decryptJson, encryptJson } from "@/utils/crypto";
import { AppError } from "@/utils/app-error";
import { mapMailerType, mapSmtpMailerAccountStatus, mapSmtpMailerHealth } from "@/utils/enum-mappers";

type SmtpMailerAccountDto = {
  id: string;
  type: "gmail" | "domain" | "mask";
  label: string;
  email: string;
  status: "active" | "paused" | "archived";
  healthStatus: "active" | "burned" | "banned" | "not_working";
  lastHealthCheckAt: string | null;
  lastHealthMessage: string | null;
  dailyLimit: number;
  hasCredentials: boolean;
};

export async function getSmtpMailerAccountMetrics() {
  const [accounts, policies] = await Promise.all([
    prisma.smtpMailerAccount.findMany(),
    prisma.mailerPolicy.findMany(),
  ]);

  const gmailAccounts = accounts.filter((item) => item.type === MailerType.GMAIL);
  const domainAccounts = accounts.filter((item) => item.type === MailerType.DOMAIN);
  const serverAccounts = accounts.filter((item) => item.type === MailerType.MASK);
  const maskPolicy = policies.find((item) => item.mailerType === MailerType.MASK);
  const serverDailyLimit = maskPolicy?.dailyLimit ?? defaultDailyLimit(MailerType.MASK);
  const totalServers = 1;
  const serverTotalCapacity = serverDailyLimit * totalServers;

  const uniqueDomains = new Set(
    domainAccounts
      .map((account) => account.email.split("@")[1]?.toLowerCase())
      .filter(Boolean),
  );
  const gmailDailyCapacity = gmailAccounts.reduce((total, item) => total + item.dailyLimit, 0);
  const domainDailyCapacity = domainAccounts.reduce((total, item) => total + item.dailyLimit, 0);

  return {
    totalGmailAccounts: gmailAccounts.length,
    totalDomainAccounts: domainAccounts.length,
    totalDomains: uniqueDomains.size,
    totalMailboxes: domainAccounts.length,
    totalServers,
    gmailDailyCapacity,
    domainDailyCapacity,
    serverTotalCapacity,
    totalCapacity: gmailDailyCapacity + domainDailyCapacity + serverTotalCapacity,
  };
}

export async function listSmtpMailerAccounts(): Promise<SmtpMailerAccountDto[]> {
  const accounts = await prisma.smtpMailerAccount.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });

  return accounts.map((account) => ({
    id: account.id,
    type: mapMailerType(account.type),
    label: account.label,
    email: account.email,
    status: mapSmtpMailerAccountStatus(account.status),
    healthStatus: mapSmtpMailerHealth(account.healthStatus),
    lastHealthCheckAt: account.lastHealthCheckAt?.toISOString() ?? null,
    lastHealthMessage: account.lastHealthMessage ?? null,
    dailyLimit: account.dailyLimit,
    hasCredentials: Boolean(account.credentialsEncrypted),
  }));
}

export async function createSmtpMailerAccount(input: {
  type: MailerType;
  label: string;
  email: string;
  status?: SmtpMailerAccountStatus;
  healthStatus?: SmtpMailerHealthStatus;
  password?: string;
  appPassword?: string;
}) {
  const policy = await prisma.mailerPolicy.findUnique({
    where: { mailerType: input.type },
  });
  const credentials = buildCredentials(input.type, input);

  const account = await prisma.smtpMailerAccount.create({
    data: {
      type: input.type,
      label: input.label,
      email: input.email,
      provider: inferProvider(input.type),
      dailyLimit: policy?.dailyLimit ?? defaultDailyLimit(input.type),
      status: input.status ?? SmtpMailerAccountStatus.ACTIVE,
      healthStatus: input.healthStatus ?? SmtpMailerHealthStatus.ACTIVE,
      credentialsEncrypted: credentials ? encryptJson(credentials) : null,
    },
  });

  return {
    id: account.id,
    type: mapMailerType(account.type),
    label: account.label,
    email: account.email,
    status: mapSmtpMailerAccountStatus(account.status),
    healthStatus: mapSmtpMailerHealth(account.healthStatus),
    lastHealthCheckAt: account.lastHealthCheckAt?.toISOString() ?? null,
    lastHealthMessage: account.lastHealthMessage ?? null,
    dailyLimit: account.dailyLimit,
    hasCredentials: Boolean(account.credentialsEncrypted),
  };
}

export async function updateSmtpMailerAccount(
  smtpMailerAccountId: string,
  input: Partial<{
    type: MailerType;
    label: string;
    email: string;
    status?: SmtpMailerAccountStatus;
    healthStatus: SmtpMailerHealthStatus;
    password: string;
    appPassword: string;
  }>,
) {
  const existing = await prisma.smtpMailerAccount.findUnique({
    where: { id: smtpMailerAccountId },
  });

  if (!existing) {
    throw new AppError("SMTP mailer account not found.", 404);
  }

  const nextType = input.type ?? existing.type;
  const isTypeChanging = Boolean(input.type && input.type !== existing.type);

  if (isTypeChanging && !input.password && !input.appPassword) {
    throw new AppError("Password is required when changing SMTP account type.", 400);
  }

  const [credentials, policy] = await Promise.all([
    Promise.resolve(buildCredentials(nextType, input, false)),
    input.type
      ? prisma.mailerPolicy.findUnique({ where: { mailerType: input.type } })
      : Promise.resolve(null),
  ]);

  const account = await prisma.smtpMailerAccount.update({
    where: { id: smtpMailerAccountId },
    data: {
      type: input.type,
      provider: input.type ? inferProvider(input.type) : undefined,
      dailyLimit: input.type ? policy?.dailyLimit ?? defaultDailyLimit(input.type) : undefined,
      label: input.label,
      email: input.email,
      status: input.status,
      healthStatus: input.healthStatus,
      credentialsEncrypted: credentials
        ? encryptJson(credentials)
        : undefined,
    },
  });

  return {
    id: account.id,
    type: mapMailerType(account.type),
    label: account.label,
    email: account.email,
    status: mapSmtpMailerAccountStatus(account.status),
    healthStatus: mapSmtpMailerHealth(account.healthStatus),
    lastHealthCheckAt: account.lastHealthCheckAt?.toISOString() ?? null,
    lastHealthMessage: account.lastHealthMessage ?? null,
    dailyLimit: account.dailyLimit,
    hasCredentials: Boolean(account.credentialsEncrypted),
  };
}

export async function deleteSmtpMailerAccount(smtpMailerAccountId: string) {
  const existing = await prisma.smtpMailerAccount.findUnique({
    where: { id: smtpMailerAccountId },
  });

  if (!existing) {
    throw new AppError("SMTP mailer account not found.", 404);
  }

  await prisma.smtpMailerAccount.delete({ where: { id: smtpMailerAccountId } });
  return { deleted: true };
}

export async function testSmtpMailerAccount(smtpMailerAccountId: string) {
  const account = await prisma.smtpMailerAccount.findUnique({
    where: { id: smtpMailerAccountId },
  });

  if (!account) {
    throw new AppError("SMTP mailer account not found.", 404);
  }

  if (account.type === MailerType.MASK) {
    throw new AppError("Use mask server health endpoint for mask infrastructure.", 400);
  }

  const credentials = decryptJson<{ appPassword?: string; password?: string }>(
    account.credentialsEncrypted,
  );

  if (!credentials) {
    return markSmtpMailerAccountNotWorking(
      smtpMailerAccountId,
      "Account credentials are not configured.",
    );
  }

  const transporter = nodemailer.createTransport(
    account.type === MailerType.GMAIL
      ? {
          service: "gmail",
          auth: {
            user: account.email,
            pass: credentials.appPassword ?? "",
          },
        }
      : {
          host: "smtp.zoho.com",
          port: 465,
          secure: true,
          auth: {
            user: account.email,
            pass: credentials.password ?? "",
          },
        },
  );

  try {
    await transporter.verify();

    const updated = await prisma.smtpMailerAccount.update({
      where: { id: smtpMailerAccountId },
      data: {
        healthStatus: SmtpMailerHealthStatus.ACTIVE,
        lastHealthCheckAt: new Date(),
        lastHealthMessage: "Connection verified successfully.",
      },
    });

    return {
      id: updated.id,
      healthStatus: "active" as const,
      lastHealthCheckAt: updated.lastHealthCheckAt?.toISOString() ?? null,
      lastHealthMessage: updated.lastHealthMessage,
    };
  } catch (error) {
    const message = sanitizeSmtpHealthMessage(
      error instanceof Error ? error.message : "Connection verification failed.",
    );

    return markSmtpMailerAccountNotWorking(smtpMailerAccountId, message);
  }
}

function sanitizeSmtpHealthMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("535") || normalized.includes("badcredentials") || normalized.includes("username and password not accepted") || normalized.includes("invalid login")) {
    return "Authentication failed. Check SMTP email and app password.";
  }

  if (normalized.includes("timeout") || normalized.includes("timed out") || normalized.includes("etimedout")) {
    return "Connection timed out. Check SMTP host, port, and network access.";
  }

  if (normalized.includes("econnrefused") || normalized.includes("connection refused")) {
    return "Connection refused. Check SMTP host and port.";
  }

  if (normalized.includes("certificate") || normalized.includes("tls") || normalized.includes("ssl")) {
    return "TLS verification failed. Check SMTP security settings.";
  }

  return "Connection verification failed.";
}

async function markSmtpMailerAccountNotWorking(
  smtpMailerAccountId: string,
  message: string,
) {
  const updated = await prisma.smtpMailerAccount.update({
    where: { id: smtpMailerAccountId },
    data: {
      healthStatus: SmtpMailerHealthStatus.NOT_WORKING,
      lastHealthCheckAt: new Date(),
      lastHealthMessage: message,
    },
  });

  return {
    id: updated.id,
    healthStatus: "not_working" as const,
    lastHealthCheckAt: updated.lastHealthCheckAt?.toISOString() ?? null,
    lastHealthMessage: updated.lastHealthMessage,
  };
}
function buildCredentials(
  mailerType: MailerType,
  input: {
    password?: string;
    appPassword?: string;
  },
  requireForCreate = true,
) {
  if (mailerType === MailerType.GMAIL) {
    if (input.appPassword || input.password) {
      return { appPassword: input.appPassword ?? input.password ?? "" };
    }
    if (requireForCreate) {
      throw new AppError("Password is required for Gmail accounts.", 400);
    }
    return null;
  }

  if (mailerType === MailerType.DOMAIN) {
    if (input.password) {
      return { password: input.password };
    }
    if (requireForCreate) {
      throw new AppError("Password is required for domain accounts.", 400);
    }
    return null;
  }

  return null;
}

function inferProvider(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return "gmail";
  if (mailerType === MailerType.DOMAIN) return "zoho";
  return "mask-vps";
}

function defaultDailyLimit(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return 150;
  if (mailerType === MailerType.DOMAIN) return 200;
  return 2000;
}
