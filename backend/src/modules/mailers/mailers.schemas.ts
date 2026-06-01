import { z } from "zod";

const basicEmailSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value), {
    message: "Invalid email address.",
  });

const attachmentSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentBase64: z.string().min(1),
});

export const gmailMailerSchema = z.object({
  fromName: z.string().min(1),
  to: z.string().min(1),
  replyTo: z.string().email(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1),
  previewText: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  content: z.string().min(1),
});

export const domainMailerSchema = z.object({
  fromName: z.string().min(1),
  to: z.string().min(1),
  replyTo: z.string().email(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1),
  previewText: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  content: z.string().min(1),
});

export const maskMailerSchema = z.object({
  fromName: z.string().min(1),
  fromEmail: basicEmailSchema,
  to: z.string().min(1),
  replyTo: basicEmailSchema,
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1),
  previewText: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  content: z.string().min(1),
});
