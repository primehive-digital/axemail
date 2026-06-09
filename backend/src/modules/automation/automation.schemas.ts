import { z } from "zod";

import { toPrismaMailerType } from "@/utils/enum-mappers";

const mailerTypeSchema = z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType);
const maskEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const workerStatusSchema = z.enum(["working", "paused"]);

const automationWorkerBaseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  pseudoName: z.string().trim().min(1).max(120),
  status: workerStatusSchema.default("paused"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/u),
});

const automationLeadBaseSchema = z.object({
  templateId: z.string().min(1),
  mailerType: mailerTypeSchema,
  fromName: z.string().trim().min(1).max(120),
  fromEmail: z.string().trim().optional(),
  replyTo: z.string().trim().email(),
  subject: z.string().trim().max(240).optional(),
  previewText: z.string().trim().max(240).optional(),
  recipientEmail: z.string().trim().email(),
  clientName: z.string().trim().max(160).optional(),
  templateValues: z.record(z.string(), z.string().trim()).default({}),
});

export const workerIdSchema = z.object({
  workerId: z.string().min(1),
});

export const leadIdSchema = z.object({
  leadId: z.string().min(1),
});

export const createAutomationWorkerSchema = automationWorkerBaseSchema;

export const updateAutomationWorkerSchema = automationWorkerBaseSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});

export const automationLeadInputSchema = automationLeadBaseSchema.superRefine((value, ctx) => {
  if (value.mailerType === "MASK" && !value.fromEmail) {
    ctx.addIssue({ code: "custom", message: "From email is required for mask mailer leads.", path: ["fromEmail"] });
  }
});

export const createAutomationLeadsSchema = z.object({
  leads: z.array(automationLeadInputSchema).min(1).max(500),
});

export const updateAutomationLeadSchema = automationLeadBaseSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});

export const processAutomationWorkerSchema = z.object({
  limit: z.coerce.number().int().min(1).max(25).default(10),
});


