import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const maxAttachmentSize = 10 * 1024 * 1024;
const maxAttachmentCount = 10;
const maxTotalAttachmentSize = 20 * 1024 * 1024;

const basicEmailSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => emailRegex.test(value), {
    message: "Invalid email address.",
  });

const emailListSchema = z
  .string()
  .trim()
  .min(1)
  .max(10_000)
  .refine((value) => {
    const recipients = splitEmailList(value);
    return recipients.length > 0 && recipients.length <= 500 && recipients.every((email) => emailRegex.test(email));
  }, {
    message: "Enter no more than 500 valid email addresses.",
  });

const optionalEmailListSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || splitEmailList(value).every((email) => emailRegex.test(email)), {
    message: "Invalid email address list.",
  });

const attachmentSchema = z
  .object({
    filename: z.string().trim().min(1).max(180),
    mimeType: z.string().trim().min(1).max(120),
    size: z.number().int().positive().max(maxAttachmentSize),
    contentBase64: z.string().min(1).refine((value) => /^[A-Za-z0-9+/]+={0,2}$/u.test(value), {
      message: "Invalid attachment content.",
    }),
  })
  .superRefine((attachment, context) => {
    const decodedSize = Buffer.byteLength(Buffer.from(attachment.contentBase64, "base64"));

    if (decodedSize !== attachment.size) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Attachment size does not match uploaded content.",
        path: ["contentBase64"],
      });
    }
  });

const attachmentsSchema = z
  .array(attachmentSchema)
  .max(maxAttachmentCount)
  .superRefine((attachments, context) => {
    const totalSize = attachments.reduce((total, attachment) => total + attachment.size, 0);

    if (totalSize > maxTotalAttachmentSize) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total attachments cannot exceed 20 MB.",
      });
    }
  })
  .optional();

const contentSchema = z
  .string()
  .trim()
  .min(1)
  .max(250_000)
  .refine((value) => stripHtml(value).length > 0, {
    message: "Content is required.",
  });

const baseMailerSchema = {
  fromName: z.string().trim().min(1),
  to: emailListSchema,
  replyTo: basicEmailSchema,
  cc: optionalEmailListSchema,
  bcc: optionalEmailListSchema,
  subject: z.string().trim().min(1).max(180),
  previewText: z.string().trim().max(300).optional(),
  attachments: attachmentsSchema,
  content: contentSchema,
};

export const gmailMailerSchema = z.object(baseMailerSchema);

export const domainMailerSchema = z.object(baseMailerSchema);

export const maskMailerSchema = z.object({
  ...baseMailerSchema,
  fromEmail: basicEmailSchema,
});

function splitEmailList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/gu, "")
    .replace(/&nbsp;/gu, " ")
    .trim();
}
