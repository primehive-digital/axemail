import { z } from "zod";

import { toPrismaMailerType } from "@/utils/enum-mappers";

const mailerTypeSchema = z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType);
const maskEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const emailListSchema = z.string().trim().min(1).max(10_000).refine(
  (value) => {
    const recipients = value.split(",").map((item) => item.trim()).filter(Boolean);
    return recipients.length > 0 && recipients.length <= 500 && recipients.every((email) => maskEmailRegex.test(email));
  },
  { message: "Enter between 1 and 500 valid recipient email addresses." },
);

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
  subject: z.string().trim().min(1).max(180),
  contentHtml: z.string().trim().min(1).max(250_000),
  supportedMailers: z.array(mailerTypeSchema).min(1).max(3),
  fields: z.array(templateFieldSchema).max(24).default([]),
});

export const updateTemplateSchema = createTemplateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required.",
});

export const templateSenderQuerySchema = z.object({
  mailerType: mailerTypeSchema,
});

const sendTemplateBaseSchema = z.object({
  templateId: z.string().min(1),
  mailerType: mailerTypeSchema,
  fromName: z.string().trim().min(1),
  fromEmail: z.string().trim().optional(),
  to: emailListSchema,
  replyTo: z.string().trim().email(),
  previewText: z.string().trim().optional(),
  templateValues: z.record(z.string(), z.string().trim()).default({}),
});


export const sendTemplateSchema = sendTemplateBaseSchema.superRefine((value, context) => {
  if (value.mailerType === "MASK" && !value.fromEmail) {
    context.addIssue({ code: "custom", message: "From email is required for mask mailer.", path: ["fromEmail"] });
    return;
  }

  if (value.fromEmail && !maskEmailRegex.test(value.fromEmail)) {
    context.addIssue({ code: "custom", message: "Invalid mask from email address.", path: ["fromEmail"] });
  }
});
