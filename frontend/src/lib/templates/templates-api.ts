import type { MailerType } from "@/constants/enum";
import { extractApiErrorMessage } from "@/lib/api-client";
import type { MailerSendResult } from "@/lib/outreach/outreach-api";

export type TemplateFieldType = "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "textarea";

export type TemplateField = {
  key: string;
  label: string;
  placeholder?: string;
  type: TemplateFieldType;
  required: boolean;
};

export type EmailTemplate = {
  id: string;
  key: string;
  name: string;
  fields: TemplateField[];
  supportedMailers: MailerType[];
  subject: string;
  contentHtml: string;
  createdById: string | null;
  createdBy: { name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type TemplatePayload = {
  name: string;
  subject: string;
  contentHtml: string;
  supportedMailers: MailerType[];
  fields: TemplateField[];
};

export type TemplateReplyToOption = {
  id: string;
  mailerType: MailerType;
  label: string;
  email: string;
};

export type TemplateSenderDashboardData = {
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
  mailerTypes: Array<{ value: MailerType; label: string }>;
  templates: EmailTemplate[];
  replyToOptions: TemplateReplyToOption[];
};

export type SendTemplatePayload = {
  templateId: string;
  mailerType: MailerType;
  fromName: string;
  fromEmail?: string;
  to: string;
  replyTo: string;
  previewText?: string;
  templateValues: Record<string, string>;
};

export async function listTemplates() {
  return requestJson<EmailTemplate[]>("/api/templates");
}

export async function createTemplate(input: TemplatePayload) {
  return requestJson<EmailTemplate>("/api/templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTemplate(templateId: string, input: TemplatePayload) {
  return requestJson<EmailTemplate>(`/api/templates/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTemplate(templateId: string) {
  return requestJson<{ deleted: boolean }>(`/api/templates/${templateId}`, {
    method: "DELETE",
  });
}

export async function getTemplateSenderDashboard(mailerType: MailerType) {
  return requestJson<TemplateSenderDashboardData>(`/api/dashboard/template-sender?mailerType=${mailerType}`);
}

export async function sendTemplateMail(input: SendTemplatePayload) {
  return requestJson<MailerSendResult>("/api/templates/send", {
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


