import crypto from "node:crypto";

import { MailerType, Role } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { sendComposerCampaign } from "@/services/mailer-delivery.service";
import { buildUserUsage } from "@/services/quota.service";
import type { MailerComposerPayload } from "@/types/mailer.types";
import { AppError } from "@/utils/app-error";
import { mapMailerType } from "@/utils/enum-mappers";

export type TemplateFieldDto = {
  key: string;
  label: string;
  placeholder?: string;
  type: "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "textarea";
  required: boolean;
};

type TemplateInput = {
  name: string;
  description?: string;
  subject: string;
  contentHtml: string;
  supportedMailers: MailerType[];
  fields: TemplateFieldDto[];
  isActive?: boolean;
};

export async function listTemplates(input: { role: Role; userId: string }) {
  const templates = await prisma.emailTemplate.findMany({
    where: input.role === Role.MANAGER ? { createdById: input.userId } : undefined,
    include: { createdBy: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return templates.map(mapTemplate);
}

export async function createTemplate(input: TemplateInput & { createdById: string }) {
  const template = await prisma.emailTemplate.create({
    data: {
      key: await createTemplateKey(input.name),
      name: input.name,
      description: input.description,
      subject: input.subject,
      contentHtml: input.contentHtml,
      fields: input.fields,
      supportedMailers: input.supportedMailers.map(mapMailerType),
      isActive: input.isActive ?? true,
      createdById: input.createdById,
    },
    include: { createdBy: { select: { firstName: true, lastName: true, email: true } } },
  });

  return mapTemplate(template);
}

export async function updateTemplate(input: {
  templateId: string;
  role: Role;
  userId: string;
  input: Partial<TemplateInput>;
}) {
  await assertTemplateAccess(input.templateId, input.role, input.userId);

  const template = await prisma.emailTemplate.update({
    where: { id: input.templateId },
    data: {
      name: input.input.name,
      description: input.input.description,
      subject: input.input.subject,
      contentHtml: input.input.contentHtml,
      fields: input.input.fields,
      supportedMailers: input.input.supportedMailers?.map(mapMailerType),
      isActive: input.input.isActive,
    },
    include: { createdBy: { select: { firstName: true, lastName: true, email: true } } },
  });

  return mapTemplate(template);
}

export async function deleteTemplate(input: { templateId: string; role: Role; userId: string }) {
  await assertTemplateAccess(input.templateId, input.role, input.userId);
  await prisma.emailTemplate.delete({ where: { id: input.templateId } });
  return { deleted: true };
}

export async function getTemplateSenderDashboard(input: { userId: string; mailerType: MailerType }) {
  const [usage, templates] = await Promise.all([
    buildUserUsage(input.userId),
    prisma.emailTemplate.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const quota = usage.mailerQuotas.find((item) => item.type === mapMailerType(input.mailerType));
  const visibleTemplates = templates.filter((template) => getSupportedMailers(template.supportedMailers).includes(mapMailerType(input.mailerType)));

  return {
    mailerType: mapMailerType(input.mailerType),
    capacity: {
      title: `${formatMailerName(input.mailerType)} Capacity`,
      allotted: quota?.assignedLimit ?? 0,
      sent: quota?.used ?? 0,
      remaining: quota?.remaining ?? 0,
    },
    cooldown: buildCooldown(input.mailerType),
    mailerTypes: [MailerType.GMAIL, MailerType.DOMAIN, MailerType.MASK].map((mailerType) => ({
      value: mapMailerType(mailerType),
      label: formatMailerName(mailerType),
    })),
    templates: visibleTemplates.map(mapTemplate),
  };
}

export async function sendTemplateMail(input: {
  userId: string;
  role: Role;
  templateId: string;
  mailerType: MailerType;
  fromName: string;
  fromEmail?: string;
  to: string;
  replyTo: string;
  previewText?: string;
  templateValues: Record<string, string>;
}) {
  const template = await prisma.emailTemplate.findUnique({ where: { id: input.templateId } });

  if (!template || !template.isActive) {
    throw new AppError("Template is not available.", 404);
  }

  const supportedMailers = getSupportedMailers(template.supportedMailers);
  const mailerType = mapMailerType(input.mailerType);

  if (!supportedMailers.includes(mailerType)) {
    throw new AppError("Selected template does not support this mailer type.", 400);
  }

  const fields = getTemplateFields(template.fields);
  for (const field of fields) {
    const value = input.templateValues[field.key]?.trim() ?? "";

    if (field.required && !value) {
      throw new AppError(`${field.label} is required.`, 400);
    }
  }

  const payload: MailerComposerPayload = {
    userId: input.userId,
    role: input.role,
    mailerType,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
    to: input.to,
    replyTo: input.replyTo,
    subject: renderTemplateString(template.subject, input.templateValues),
    previewText: input.previewText,
    content: renderTemplateString(template.contentHtml, input.templateValues),
    attachments: [],
  };

  return sendComposerCampaign(payload);
}

async function assertTemplateAccess(templateId: string, role: Role, userId: string) {
  const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });

  if (!template) {
    throw new AppError("Template not found.", 404);
  }

  if (role === Role.MANAGER && template.createdById !== userId) {
    throw new AppError("You can only manage templates you created.", 403);
  }
}

async function createTemplateKey(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 48) || "template";
  const key = `${base}-${crypto.randomBytes(3).toString("hex")}`;
  const existing = await prisma.emailTemplate.findUnique({ where: { key } });

  return existing ? `${base}-${crypto.randomBytes(4).toString("hex")}` : key;
}

function mapTemplate(template: {
  id: string;
  key: string;
  name: string;
  description: string | null;
  fields: unknown;
  supportedMailers: unknown;
  subject: string;
  contentHtml: string;
  isActive: boolean;
  createdById: string | null;
  createdBy?: { firstName: string; lastName: string; email: string } | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: template.id,
    key: template.key,
    name: template.name,
    description: template.description,
    fields: getTemplateFields(template.fields),
    supportedMailers: getSupportedMailers(template.supportedMailers),
    subject: template.subject,
    contentHtml: template.contentHtml,
    isActive: template.isActive,
    createdById: template.createdById,
    createdBy: template.createdBy
      ? {
          name: `${template.createdBy.firstName} ${template.createdBy.lastName}`,
          email: template.createdBy.email,
        }
      : null,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}

function getTemplateFields(value: unknown): TemplateFieldDto[] {
  if (!Array.isArray(value)) return [];

  const fields: TemplateFieldDto[] = [];

  for (const field of value) {
    if (!field || typeof field !== "object") continue;
    const record = field as Record<string, unknown>;
    const key = typeof record.key === "string" ? record.key : "";
    const label = typeof record.label === "string" ? record.label : key;

    if (!key || !label) continue;

    fields.push({
      key,
      label,
      placeholder: typeof record.placeholder === "string" ? record.placeholder : "",
      type: normalizeFieldType(record.type),
      required: Boolean(record.required),
    });
  }

  return fields;
}

function getSupportedMailers(value: unknown) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(["gmail", "domain", "mask"]);
  return value.filter((item): item is "gmail" | "domain" | "mask" => typeof item === "string" && allowed.has(item));
}

function normalizeFieldType(value: unknown): TemplateFieldDto["type"] {
  const allowed = ["text", "email", "tel", "number", "date", "datetime-local", "textarea"] as const;
  return typeof value === "string" && allowed.includes(value as TemplateFieldDto["type"]) ? value as TemplateFieldDto["type"] : "text";
}

function renderTemplateString(template: string, values: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/gu, (_match, key: string) => escapeHtml(values[key]?.trim() ?? ""));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#039;");
}

function buildCooldown(mailerType: MailerType) {
  if (mailerType === MailerType.MASK) {
    return { enabled: false, secondsRemaining: 0, progress: 0 };
  }

  return { enabled: true, secondsRemaining: 60, progress: 100 };
}

function formatMailerName(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return "Gmail Mailer";
  if (mailerType === MailerType.DOMAIN) return "Domain Mailer";
  return "Mask Mailer";
}