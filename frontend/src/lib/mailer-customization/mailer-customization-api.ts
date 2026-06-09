import { extractApiErrorMessage } from "@/lib/api-client";
import type { MailerType } from "@/constants/enum";

export type ReplyToOption = {
  id: string;
  mailerType: MailerType;
  label: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type MailerCustomization = {
  mailerType: MailerType;
  title: string;
  description: string;
  logoSrc: string;
  cooldownEnabled: boolean;
  cooldownSchedule: number[];
  replyToOptions: ReplyToOption[];
};

export type MailerCustomizationDashboardData = {
  mailers: MailerCustomization[];
};

export type ReplyToOptionPayload = {
  mailerType: MailerType;
  label: string;
  email: string;
};

export async function getMailerCustomizationDashboard() {
  return requestJson<MailerCustomizationDashboardData>("/api/mailer-customization");
}

export async function createReplyToOption(input: ReplyToOptionPayload) {
  return requestJson<ReplyToOption>("/api/mailer-customization/reply-to-options", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateReplyToOption(optionId: string, input: Omit<ReplyToOptionPayload, "mailerType">) {
  return requestJson<ReplyToOption>(`/api/mailer-customization/reply-to-options/${optionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteReplyToOption(optionId: string) {
  return requestJson<{ deleted: boolean }>(`/api/mailer-customization/reply-to-options/${optionId}`, { method: "DELETE" });
}

export async function updateCooldownSchedule(mailerType: MailerType, schedule: number[]) {
  return requestJson<{ mailerType: MailerType; schedule: number[] }>(`/api/mailer-customization/${mailerType}/cooldown`, {
    method: "PATCH",
    body: JSON.stringify({ schedule }),
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

