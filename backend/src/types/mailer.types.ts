import type { MailerType } from "@/constants/enums";

export type MailerComposerPayload = {
  userId?: string;
  role?: string;
  mailerType: MailerType;
  fromName: string;
  fromEmail?: string;
  to: string;
  replyTo: string;
  cc?: string;
  bcc?: string;
  subject: string;
  previewText?: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    contentBase64: string;
  }>;
  content: string;
  metadata?: Record<string, unknown>;
};

export type ProviderDispatchPayload = {
  provider: string;
  smtpMailerAccountId: string;
  fromEmail: string;
  fromName: string;
  to: string;
  cc: string[];
  bcc: string[];
  replyTo: string;
  subject: string;
  previewText?: string;
  html: string;
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    contentBase64: string;
  }>;
  headers: Record<string, string>;
  envelope: {
    from: string;
    to: string[];
  };
  metadata: Record<string, unknown>;
};
