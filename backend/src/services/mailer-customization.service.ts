import { MailerType } from "@prisma/client";

import { env } from "@/config/env";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/app-error";
import { mapMailerType } from "@/utils/enum-mappers";

const mailerTypes = [MailerType.GMAIL, MailerType.DOMAIN, MailerType.MASK] as const;

export async function getMailerCustomizationDashboard() {
  const [replyToOptions, cooldownSettings] = await Promise.all([
    prisma.mailerReplyToOption.findMany({ orderBy: [{ mailerType: "asc" }, { label: "asc" }] }),
    prisma.mailerCooldownSetting.findMany(),
  ]);
  const cooldownByType = new Map(cooldownSettings.map((setting) => [setting.mailerType, setting.schedule]));

  return {
    mailers: mailerTypes.map((mailerType) => ({
      mailerType: mapMailerType(mailerType),
      title: formatMailerName(mailerType),
      description: buildMailerDescription(mailerType),
      logoSrc: getMailerLogo(mailerType),
      cooldownEnabled: mailerType !== MailerType.MASK,
      cooldownSchedule: getSanitizedSchedule(cooldownByType.get(mailerType) ?? getDefaultCooldownSchedule(mailerType)),
      replyToOptions: replyToOptions
        .filter((option) => option.mailerType === mailerType)
        .map(mapReplyToOption),
    })),
  };
}

export async function createReplyToOption(input: { mailerType: MailerType; label: string; email: string }) {
  const option = await prisma.mailerReplyToOption.create({
    data: {
      mailerType: input.mailerType,
      label: input.label,
      email: input.email.toLowerCase(),
    },
  }).catch((error: unknown) => {
    if (isUniqueError(error)) throw new AppError("This reply-to email already exists for the selected mailer.", 409);
    throw error;
  });

  return mapReplyToOption(option);
}

export async function updateReplyToOption(input: { optionId: string; label: string; email: string }) {
  const existing = await prisma.mailerReplyToOption.findUnique({ where: { id: input.optionId } });
  if (!existing) throw new AppError("Reply-to option was not found.", 404);

  const option = await prisma.mailerReplyToOption.update({
    where: { id: input.optionId },
    data: {
      label: input.label,
      email: input.email.toLowerCase(),
    },
  }).catch((error: unknown) => {
    if (isUniqueError(error)) throw new AppError("This reply-to email already exists for the selected mailer.", 409);
    throw error;
  });

  return mapReplyToOption(option);
}

export async function deleteReplyToOption(optionId: string) {
  const existing = await prisma.mailerReplyToOption.findUnique({ where: { id: optionId } });
  if (!existing) throw new AppError("Reply-to option was not found.", 404);
  await prisma.mailerReplyToOption.delete({ where: { id: optionId } });
  return { deleted: true };
}

export async function updateMailerCooldownSchedule(input: { mailerType: MailerType; schedule: number[] }) {
  if (input.mailerType === MailerType.MASK) {
    throw new AppError("Mask mailer does not use cooldown settings.", 400);
  }

  const schedule = getSanitizedSchedule(input.schedule);
  const setting = await prisma.mailerCooldownSetting.upsert({
    where: { mailerType: input.mailerType },
    update: { schedule },
    create: { mailerType: input.mailerType, schedule },
  });

  return {
    mailerType: mapMailerType(setting.mailerType),
    schedule: setting.schedule,
  };
}

export async function listReplyToOptionsForMailer(mailerType: MailerType) {
  const options = await prisma.mailerReplyToOption.findMany({
    where: { mailerType },
    orderBy: [{ label: "asc" }, { email: "asc" }],
  });

  return options.map(mapReplyToOption);
}

export async function assertReplyToAllowed(input: { mailerType: MailerType; replyTo: string }) {
  const email = input.replyTo.trim().toLowerCase();
  const option = await prisma.mailerReplyToOption.findUnique({
    where: {
      mailerType_email: {
        mailerType: input.mailerType,
        email,
      },
    },
  });

  if (!option) {
    throw new AppError("Select a valid reply-to email for this mailer.", 400);
  }
}

export async function getMailerCooldownSchedule(mailerType: MailerType) {
  if (mailerType === MailerType.MASK) return [];

  const setting = await prisma.mailerCooldownSetting.findUnique({ where: { mailerType } });
  return getSanitizedSchedule(setting?.schedule?.length ? setting.schedule : getDefaultCooldownSchedule(mailerType));
}

export async function buildMailerCooldown(mailerType: MailerType) {
  if (mailerType === MailerType.MASK) {
    return { enabled: false, secondsRemaining: 0, progress: 0 };
  }

  const schedule = await getMailerCooldownSchedule(mailerType);
  return { enabled: true, secondsRemaining: schedule[0] ?? 20, progress: 100 };
}

function mapReplyToOption(option: { id: string; mailerType: MailerType; label: string; email: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: option.id,
    mailerType: mapMailerType(option.mailerType),
    label: option.label,
    email: option.email,
    createdAt: option.createdAt.toISOString(),
    updatedAt: option.updatedAt.toISOString(),
  };
}

function getDefaultCooldownSchedule(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return env.GMAIL_COOLDOWN_SCHEDULE;
  if (mailerType === MailerType.DOMAIN) return env.DOMAIN_COOLDOWN_SCHEDULE;
  return [];
}

function getSanitizedSchedule(schedule: number[]) {
  return schedule.map((value) => Math.trunc(value)).filter((value) => value > 0 && value <= 3600).slice(0, 12);
}

function formatMailerName(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return "Gmail Mailer";
  if (mailerType === MailerType.DOMAIN) return "Domain Mailer";
  return "Mask Mailer";
}

function buildMailerDescription(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return "Manage Gmail reply-to options and cooldown behavior.";
  if (mailerType === MailerType.DOMAIN) return "Manage domain reply-to options and cooldown behavior.";
  return "Manage mask mailer reply-to options.";
}

function getMailerLogo(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return "/icons/gmail-capacity-logo.png";
  if (mailerType === MailerType.DOMAIN) return "/icons/domain-capacity-logo.png";
  return "/icons/mask-capacity-logo.png";
}

function isUniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

