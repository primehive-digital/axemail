import type { MailerType } from "@/constants/enum";
import { extractApiErrorMessage } from "@/lib/api-client";
import type { TemplateField } from "@/lib/templates/templates-api";

export type AutomationWorkerStatus = "working" | "paused";
export type AutomationLeadStatus = "pending" | "sent" | "failed" | "skipped";

export type AutomationEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AutomationTemplate = {
  id: string;
  key: string;
  name: string;
  fields: TemplateField[];
  supportedMailers: MailerType[];
};

export type AutomationWorker = {
  id: string;
  name: string;
  pseudoName: string;
  status: AutomationWorkerStatus;
  startTime: string;
  allocations: {
    gmail: number;
    domain: number;
    mask: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type AutomationLead = {
  id: string;
  workerId: string | null;
  workerName: string | null;
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
  templateValues: Record<string, string>;
  status: AutomationLeadStatus;
  errorMessage: string | null;
  scheduledAt: string;
  sentAt: string | null;
};

export type AutomationDashboardData = {
  workers: AutomationWorker[];
  leads: AutomationLead[];
  employees: AutomationEmployee[];
  templates: AutomationTemplate[];
  summary: {
    totalWorkers: number;
    activeWorkers: number;
    totalLeads: number;
    pendingLeads: number;
    sentToday: number;
    failedToday: number;
  };
};

export type AutomationWorkerPayload = {
  name: string;
  pseudoName: string;
  status: AutomationWorkerStatus;
  startTime: string;
};

export type AutomationLeadPayload = {
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

export async function getAutomationDashboard() {
  return requestJson<AutomationDashboardData>("/api/automation/dashboard");
}

export async function createAutomationWorker(input: AutomationWorkerPayload) {
  return requestJson<AutomationWorker>("/api/automation/workers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAutomationWorker(workerId: string, input: Partial<AutomationWorkerPayload>) {
  return requestJson<AutomationWorker>(`/api/automation/workers/${workerId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createAutomationLeads(leads: AutomationLeadPayload[]) {
  return requestJson<{ created: number }>("/api/automation/leads", {
    method: "POST",
    body: JSON.stringify({ leads }),
  });
}

export async function updateAutomationLead(leadId: string, input: Partial<AutomationLeadPayload>) {
  return requestJson<AutomationLead>(`/api/automation/leads/${leadId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function processAutomationWorker(workerId: string) {
  return requestJson<{ sent: number; failed: number; skipped: number }>(`/api/automation/workers/${workerId}/process`, {
    method: "POST",
    body: JSON.stringify({ limit: 10 }),
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
