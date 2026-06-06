import { extractApiErrorMessage } from "@/lib/api-client";
import type { MailerType } from "@/constants/enum";

export type MailerStatus = {
  mailerType: MailerType;
  capacity: {
    title: string;
    allotted: number;
    sent: number;
    remaining: number;
  };
  cooldown: {
    enabled: boolean;
    secondsRemaining: number;
    progress: number;
  };
};

export type MailAttachment = {
  filename: string;
  mimeType: string;
  size: number;
  contentBase64: string;
};

export type MailerSendPayload = {
  fromName: string;
  fromEmail?: string;
  to: string;
  replyTo: string;
  cc?: string;
  bcc?: string;
  subject: string;
  previewText?: string;
  attachments?: MailAttachment[];
  content: string;
};

export type MailerSendResult = {
  id: string;
  status: "completed" | "failed" | "partial";
  recipientCount: number;
};

export async function getMailerStatus(mailerType: MailerType) {
  return requestJson<MailerStatus>(`/api/dashboard/outreach/${mailerType}`);
}

export async function sendMailerMessage(mailerType: MailerType, input: MailerSendPayload) {
  return requestJson<MailerSendResult>(`/api/mailers/${mailerType}/send`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function requestJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(payload));
  }

  return payload.data as T;
}