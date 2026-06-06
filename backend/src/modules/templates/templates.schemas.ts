import { z } from "zod";

import { toPrismaMailerType } from "@/utils/enum-mappers";

const mailerTypeSchema = z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType);

export const templateIdSchema = z.object({
  templateId: z.string().min(1),
});

export const templateFieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/u),
  label: z.string().trim().min(1).max(80),
  placeholder: z.string().trim().max(120).optional(),
  type: z.enum(["text", "email", "tel", "number", "date", "datetime-local", "textarea"]).default("text"),
  required: z.boolean().default(false),
});

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(240).optional(),
  subject: z.string().trim().min(1).max(180),
  contentHtml: z.string().trim().min(1),
  supportedMailers: z.array(mailerTypeSchema).min(1).max(3),
  fields: z.array(templateFieldSchema).max(24).default([]),
  isActive: z.boolean().default(true),
});

export const updateTemplateSchema = createTemplateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});

export const templateSenderQuerySchema = z.object({
  mailerType: mailerTypeSchema,
});

export const sendTemplateSchema = z.object({
  templateId: z.string().min(1),
  mailerType: mailerTypeSchema,
  fromName: z.string().trim().min(1),
  fromEmail: z.string().trim().email().optional(),
  to: z.string().trim().min(1),
  replyTo: z.string().trim().email(),
  previewText: z.string().trim().optional(),
  templateValues: z.record(z.string(), z.string().trim()).default({}),
});