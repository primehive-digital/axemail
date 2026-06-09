import { AutomationLeadStatus, AutomationWorkerStatus, MailerType, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { sendTemplateMail } from "@/services/template.service";
import { getMailerCooldownSchedule } from "@/services/mailer-customization.service";
import { AppError } from "@/utils/app-error";
import { mapMailerType } from "@/utils/enum-mappers";

const workerProcessLimit = 10;
const randomGapMinSeconds = 30;
const randomGapMaxSeconds = 180;
let schedulerRunning = false;
let processingPromise: Promise<void> | null = null;

export async function getAutomationDashboard(input: { role: Role; userId: string }) {
  await cleanupExpiredAutomationLeads();

  const workerWhere = input.role === Role.MANAGER ? { createdById: input.userId } : undefined;
  const [workers, leads, employees, templates] = await Promise.all([
    prisma.automationWorker.findMany({
      where: workerWhere,
      include: { allocations: true },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.automationLead.findMany({
      where: { workDate: todayKey() },
      include: { worker: true },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.user.findMany({
      where: { role: Role.EMPLOYEE },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.emailTemplate.findMany({
      where: {
        isActive: true,
        ...(input.role === Role.MANAGER ? { createdById: input.userId } : {}),
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    workers: workers.map(mapWorker),
    leads: leads.map(mapLead),
    employees,
    templates: templates.map((template) => ({
      id: template.id,
      key: template.key,
      name: template.name,
      fields: normalizeTemplateFields(template.fields),
      supportedMailers: normalizeSupportedMailers(template.supportedMailers),
    })),
    summary: {
      totalWorkers: workers.length,
      activeWorkers: workers.filter((worker) => worker.status === AutomationWorkerStatus.WORKING).length,
      totalLeads: leads.length,
      pendingLeads: leads.filter((lead) => lead.status === AutomationLeadStatus.PENDING).length,
      sentToday: leads.filter((lead) => lead.status === AutomationLeadStatus.SENT).length,
      failedToday: leads.filter((lead) => lead.status === AutomationLeadStatus.FAILED).length,
    },
  };
}

export async function createAutomationWorker(input: {
  name: string;
  pseudoName: string;
  status: "working" | "paused";
  startTime: string;
  createdById: string;
}) {
  const worker = await prisma.automationWorker.create({
    data: {
      name: input.name,
      pseudoName: input.pseudoName,
      createdById: input.createdById,
      status: toWorkerStatus(input.status),
      startTime: input.startTime,
    },
    include: { allocations: true },
  });

  return mapWorker(worker);
}

export async function updateAutomationWorker(workerId: string, input: Partial<{
  name: string;
  pseudoName: string;
  status: "working" | "paused";
  startTime: string;
}>) {
  const worker = await prisma.automationWorker.update({
    where: { id: workerId },
    data: {
      name: input.name,
      pseudoName: input.pseudoName,
      status: input.status ? toWorkerStatus(input.status) : undefined,
      startTime: input.startTime,
    },
    include: { allocations: true },
  });

  return mapWorker(worker);
}

export async function createAutomationLeads(input: {
  leads: AutomationLeadInput[];
}) {
  await cleanupExpiredAutomationLeads();

  const templates = await prisma.emailTemplate.findMany({ where: { id: { in: [...new Set(input.leads.map((lead) => lead.templateId))] } } });
  const templateMap = new Map(templates.map((template) => [template.id, template]));
  const now = new Date();
  const rows: Prisma.AutomationLeadCreateManyInput[] = [];

  for (const lead of input.leads) {
    const template = templateMap.get(lead.templateId) ?? null;
    assertLeadTemplate(template, lead);

    rows.push({
      templateId: template.id,
      templateKey: template.key,
      mailerType: lead.mailerType,
      fromName: lead.fromName,
      fromEmail: lead.fromEmail,
      replyTo: lead.replyTo,
      subject: lead.subject,
      previewText: lead.previewText,
      recipientEmail: lead.recipientEmail,
      clientName: lead.clientName,
      templateValues: lead.templateValues,
      scheduledAt: now,
      workDate: todayKey(),
    });
  }

  await prisma.automationLead.createMany({ data: rows });
  return { created: rows.length };
}

export async function updateAutomationLead(leadId: string, input: Partial<AutomationLeadInput>) {
  await cleanupExpiredAutomationLeads();

  const currentLead = await prisma.automationLead.findUnique({ where: { id: leadId } });
  if (!currentLead || currentLead.workDate !== todayKey()) {
    throw new AppError("Lead was not found for today's queue.", 404);
  }

  if (currentLead.status !== AutomationLeadStatus.PENDING) {
    throw new AppError("Only pending leads can be edited.", 400);
  }

  const templateId = input.templateId ?? currentLead.templateId;
  const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
  const lead: AutomationLeadInput = {
    templateId,
    mailerType: input.mailerType ?? currentLead.mailerType,
    fromName: input.fromName ?? currentLead.fromName,
    fromEmail: input.fromEmail ?? currentLead.fromEmail ?? undefined,
    replyTo: input.replyTo ?? currentLead.replyTo,
    subject: input.subject ?? currentLead.subject ?? undefined,
    previewText: input.previewText ?? currentLead.previewText ?? undefined,
    recipientEmail: input.recipientEmail ?? currentLead.recipientEmail,
    clientName: input.clientName ?? currentLead.clientName ?? undefined,
    templateValues: input.templateValues ?? normalizeTemplateValueRecord(currentLead.templateValues),
  };

  assertLeadTemplate(template, lead);

  const updatedLead = await prisma.automationLead.update({
    where: { id: leadId },
    data: {
      templateId: template.id,
      templateKey: template.key,
      mailerType: lead.mailerType,
      fromName: lead.fromName,
      fromEmail: lead.fromEmail,
      replyTo: lead.replyTo,
      subject: lead.subject,
      previewText: lead.previewText,
      recipientEmail: lead.recipientEmail,
      clientName: lead.clientName,
      templateValues: lead.templateValues,
    },
    include: { worker: true },
  });

  return mapLead(updatedLead);
}

export async function processAutomationWorkerDueLeads(workerId: string, limit = workerProcessLimit) {
  return processWorkerLeads(workerId, limit);
}

export function startAutomationWorkerSchedule() {
  void runAutomationScheduler().catch((error) => console.error("Automation scheduler failed.", error));

  return setInterval(() => {
    void runAutomationScheduler().catch((error) => console.error("Automation scheduler failed.", error));
  }, 60 * 1000);
}

type AutomationLeadInput = {
  templateId: string;
  mailerType: MailerType;
  fromName: string;
  fromEmail?: string;
  replyTo: string;
  subject?: string;
  previewText?: string;
  recipientEmail: string;
  clientName?: string;
  templateValues: Record<string, string>;
};

async function runAutomationScheduler() {
  if (schedulerRunning) return;
  schedulerRunning = true;

  try {
    await cleanupExpiredAutomationLeads();
    const workers = await prisma.automationWorker.findMany({
      where: { status: AutomationWorkerStatus.WORKING },
      orderBy: [{ updatedAt: "asc" }],
    });

    for (const worker of workers) {
      if (!isWorkerDue(worker.startTime)) continue;
      await processWorkerLeads(worker.id, workerProcessLimit);
    }
  } finally {
    schedulerRunning = false;
  }
}

async function processWorkerLeads(workerId: string, limit: number) {
  if (processingPromise) {
    await processingPromise;
  }

  const result = { sent: 0, failed: 0, skipped: 0 };
  processingPromise = (async () => {
    const worker = await prisma.automationWorker.findUnique({ where: { id: workerId }, include: { allocations: true } });
    if (!worker || worker.status !== AutomationWorkerStatus.WORKING || !isWorkerDue(worker.startTime)) {
      return;
    }

    const auditUserId = worker.createdById ?? await getFallbackAdminUserId();
    if (!auditUserId) {
      throw new AppError("Automation worker needs a valid creator account for delivery audit.", 409);
    }

    const remainingByType = await getWorkerRemainingMap(worker.id, worker.allocations);
    if (Object.values(remainingByType).every((remaining) => remaining <= 0)) {
      return;
    }

    const leads = await prisma.automationLead.findMany({
      where: { status: AutomationLeadStatus.PENDING, workDate: todayKey(), workerId: null },
      orderBy: [{ createdAt: "asc" }],
      take: limit * 3,
    });

    for (const lead of leads) {
      if (result.sent + result.failed >= limit) break;
      if (remainingByType[lead.mailerType] <= 0) {
        result.skipped += 1;
        continue;
      }

      try {
        await sendTemplateMail({
          userId: auditUserId,
          role: Role.ADMIN,
          templateId: lead.templateId,
          mailerType: lead.mailerType,
          fromName: lead.fromName,
          fromEmail: lead.fromEmail ?? undefined,
          to: lead.recipientEmail,
          replyTo: lead.replyTo,
          previewText: lead.previewText ?? undefined,
          subjectOverride: lead.subject ?? undefined,
          templateValues: normalizeTemplateValueRecord(lead.templateValues),
          bypassUserQuota: true,
        });

        await prisma.automationLead.update({
          where: { id: lead.id },
          data: { workerId: worker.id, status: AutomationLeadStatus.SENT, sentAt: new Date(), errorMessage: null },
        });
        remainingByType[lead.mailerType] -= 1;
        result.sent += 1;
        await sleep((await getWorkerDelaySeconds(lead.mailerType)) * 1000);
      } catch (error) {
        await prisma.automationLead.update({
          where: { id: lead.id },
          data: {
            workerId: worker.id,
            status: AutomationLeadStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : "Worker delivery failed.",
          },
        });
        remainingByType[lead.mailerType] = Math.max(remainingByType[lead.mailerType] - 1, 0);
        result.failed += 1;
      }
    }
  })().finally(() => {
    processingPromise = null;
  });

  await processingPromise;
  return result;
}

async function getWorkerRemainingMap(workerId: string, allocations: Array<{ mailerType: MailerType; assignedLimit: number }>) {
  const sentRows = await prisma.automationLead.groupBy({
    by: ["mailerType"],
    where: { workerId, workDate: todayKey(), status: AutomationLeadStatus.SENT },
    _count: { _all: true },
  });
  const sentMap = sentRows.reduce<Record<MailerType, number>>((accumulator, row) => {
    accumulator[row.mailerType] = row._count._all;
    return accumulator;
  }, emptyMailerMap());
  const allocationMap = allocations.reduce<Record<MailerType, number>>((accumulator, row) => {
    accumulator[row.mailerType] = row.assignedLimit;
    return accumulator;
  }, emptyMailerMap());

  return {
    [MailerType.GMAIL]: Math.max(allocationMap[MailerType.GMAIL] - sentMap[MailerType.GMAIL], 0),
    [MailerType.DOMAIN]: Math.max(allocationMap[MailerType.DOMAIN] - sentMap[MailerType.DOMAIN], 0),
    [MailerType.MASK]: Math.max(allocationMap[MailerType.MASK] - sentMap[MailerType.MASK], 0),
  };
}

async function cleanupExpiredAutomationLeads() {
  await prisma.automationLead.deleteMany({ where: { workDate: { lt: todayKey() } } });
}

async function getFallbackAdminUserId() {
  const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN }, select: { id: true }, orderBy: { createdAt: "asc" } });
  return admin?.id ?? null;
}

function assertLeadTemplate(template: Awaited<ReturnType<typeof prisma.emailTemplate.findUnique>>, lead: AutomationLeadInput): asserts template is NonNullable<typeof template> {
  if (!template || !template.isActive) {
    throw new AppError("Template is not available.", 400);
  }

  const supportedMailers = normalizeSupportedMailers(template.supportedMailers);
  if (!supportedMailers.includes(mapMailerType(lead.mailerType))) {
    throw new AppError(`${template.name} does not support ${mapMailerType(lead.mailerType)} mailer.`, 400);
  }

  if (lead.mailerType === MailerType.MASK && !lead.fromEmail?.trim()) {
    throw new AppError("From email is required for mask mailer leads.", 400);
  }

  validateTemplateValues(template.fields, lead.templateValues);
}

function isWorkerDue(startTime: string) {
  const [hour, minute] = startTime.split(":").map(Number);
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, 0));
  return now >= start;
}

function todayKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

async function getWorkerDelaySeconds(mailerType: MailerType) {
  const schedule = await getMailerCooldownSchedule(mailerType);
  const cooldown = schedule[0] ?? 0;

  return cooldown + randomGap(randomGapMinSeconds, randomGapMaxSeconds);
}

function randomGap(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toWorkerStatus(status: "working" | "paused") {
  return status === "working" ? AutomationWorkerStatus.WORKING : AutomationWorkerStatus.PAUSED;
}

function fromWorkerStatus(status: AutomationWorkerStatus) {
  return status === AutomationWorkerStatus.WORKING ? "working" : "paused";
}

function fromLeadStatus(status: AutomationLeadStatus) {
  return status.toLowerCase();
}

function emptyMailerMap(): Record<MailerType, number> {
  return {
    [MailerType.GMAIL]: 0,
    [MailerType.DOMAIN]: 0,
    [MailerType.MASK]: 0,
  };
}

function mapWorker(worker: {
  id: string;
  name: string;
  pseudoName: string;
  status: AutomationWorkerStatus;
  startTime: string;
  createdAt: Date;
  updatedAt: Date;
  allocations: Array<{ mailerType: MailerType; assignedLimit: number }>;
}) {
  const allocation = worker.allocations.reduce<Record<MailerType, number>>((accumulator, row) => {
    accumulator[row.mailerType] = row.assignedLimit;
    return accumulator;
  }, emptyMailerMap());

  return {
    id: worker.id,
    name: worker.name,
    pseudoName: worker.pseudoName,
    status: fromWorkerStatus(worker.status),
    startTime: worker.startTime,
    allocations: {
      gmail: allocation[MailerType.GMAIL],
      domain: allocation[MailerType.DOMAIN],
      mask: allocation[MailerType.MASK],
    },
    createdAt: worker.createdAt.toISOString(),
    updatedAt: worker.updatedAt.toISOString(),
  };
}

function mapLead(lead: {
  id: string;
  workerId: string | null;
  templateId: string;
  templateKey: string;
  mailerType: MailerType;
  fromName: string;
  fromEmail: string | null;
  replyTo: string;
  subject: string | null;
  previewText: string | null;
  recipientEmail: string;
  clientName: string | null;
  templateValues: unknown;
  status: AutomationLeadStatus;
  errorMessage: string | null;
  scheduledAt: Date;
  sentAt: Date | null;
  worker?: { name: string } | null;
}) {
  return {
    id: lead.id,
    workerId: lead.workerId,
    workerName: lead.worker?.name ?? null,
    templateId: lead.templateId,
    templateKey: lead.templateKey,
    mailerType: mapMailerType(lead.mailerType),
    fromName: lead.fromName,
    fromEmail: lead.fromEmail,
    replyTo: lead.replyTo,
    subject: lead.subject,
    previewText: lead.previewText,
    recipientEmail: lead.recipientEmail,
    clientName: lead.clientName,
    templateValues: normalizeTemplateValueRecord(lead.templateValues),
    status: fromLeadStatus(lead.status),
    errorMessage: lead.errorMessage,
    scheduledAt: lead.scheduledAt.toISOString(),
    sentAt: lead.sentAt?.toISOString() ?? null,
  };
}

function normalizeTemplateFields(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((field) => {
    if (!field || typeof field !== "object") return [];
    const record = field as Record<string, unknown>;
    const key = typeof record.key === "string" ? record.key : "";
    const label = typeof record.label === "string" ? record.label : key;
    if (!key || !label) return [];

    return [{
      key,
      label,
      placeholder: typeof record.placeholder === "string" ? record.placeholder : "",
      required: Boolean(record.required),
      type: typeof record.type === "string" ? record.type : "text",
    }];
  });
}

function normalizeSupportedMailers(value: unknown) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(["gmail", "domain", "mask"]);
  return value.filter((item): item is "gmail" | "domain" | "mask" => typeof item === "string" && allowed.has(item));
}

function normalizeTemplateValueRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, typeof item === "string" ? item : String(item ?? "")]),
  );
}

function validateTemplateValues(fieldsValue: unknown, values: Record<string, string>) {
  for (const field of normalizeTemplateFields(fieldsValue)) {
    if (field.required && !values[field.key]?.trim()) {
      throw new AppError(`${field.label} is required.`, 400);
    }
  }
}




