import { extractApiErrorMessage } from "@/lib/api-client";
import type { MailerSmtpHealth, MailerType } from "@/constants/enum";

export type MailerPolicy = {
  mailerType: MailerType;
  title: string;
  description: string;
  dailyLimit: number;
};

export type SavedMailerPolicy = {
  id: string;
  mailerType: MailerType;
  dailyLimit: number;
};

export type SmtpMailerAccount = {
  id: string;
  type: Exclude<MailerType, "mask">;
  label: string;
  email: string;
  status: "active" | "paused" | "archived";
  healthStatus: MailerSmtpHealth;
  lastHealthCheckAt: string | null;
  lastHealthMessage: string | null;
  dailyLimit: number;
  hasCredentials: boolean;
};

export type MaskServerHealth = {
  status: "active" | "not_working";
  responseTimeMs: number;
  endpoint: string;
  details: unknown;
};

export type InfrastructureControlDashboardData = {
  policies: MailerPolicy[];
  smtpMailerAccounts: SmtpMailerAccount[];
  maskServer: MaskServerHealth;
};

export type SmtpMailerAccountPayload = {
  type: Exclude<MailerType, "mask">;
  label: string;
  email: string;
  password?: string;
};

export async function getInfrastructureControlDashboard() {
  return requestJson<InfrastructureControlDashboardData>("/api/dashboard/infrastructure-control");
}

export async function updateMailerPolicy(mailerType: MailerType, dailyLimit: number) {
  return requestJson<SavedMailerPolicy>(`/api/mailer-policies/${mailerType}`, {
    method: "PUT",
    body: JSON.stringify({ dailyLimit }),
  });
}

export async function createSmtpMailerAccount(input: Required<SmtpMailerAccountPayload>) {
  return requestJson<SmtpMailerAccount>("/api/smtp-mailer-accounts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSmtpMailerAccount(smtpMailerAccountId: string, input: SmtpMailerAccountPayload) {
  const body = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== ""),
  );

  return requestJson<SmtpMailerAccount>(`/api/smtp-mailer-accounts/${smtpMailerAccountId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteSmtpMailerAccount(smtpMailerAccountId: string) {
  return requestJson<{ deleted: boolean }>(`/api/smtp-mailer-accounts/${smtpMailerAccountId}`, {
    method: "DELETE",
  });
}

export async function testSmtpMailerAccount(account: SmtpMailerAccount) {
  return requestJson<Pick<SmtpMailerAccount, "id" | "healthStatus" | "lastHealthCheckAt" | "lastHealthMessage">>(`/api/smtp-mailer-accounts/${account.id}/test`, {
    method: "POST",
    body: JSON.stringify({ email: account.email }),
  });
}

export async function testMaskServer() {
  return requestJson<MaskServerHealth>("/api/mask-server/health");
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
    throw new Error(extractApiErrorMessage(payload, response.status === 404 ? "SMTP mailer account was not found. Refresh data and try again." : "Request failed."));
  }

  return payload.data as T;
}