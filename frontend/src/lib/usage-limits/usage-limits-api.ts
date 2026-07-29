import { extractApiErrorMessage } from "@/lib/api-client";

export type UsageMetric = {
  key: string;
  title: string;
  label: string;
  value: number;
  description: string;
};

export type SenderLimit = {
  key: "gmail" | "domain" | "mask";
  resource: string;
  description: string;
  perAccount: number;
  perDay: number;
  perMonth: number;
  officeDaysPerMonth: number;
};

export type UsageLimitsDashboardData = {
  metrics: UsageMetric[];
  limits: SenderLimit[];
};

export async function getUsageLimitsDashboard() {
  const response = await fetch("/api/dashboard/usage-limits");
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(payload));
  }

  return payload.data as UsageLimitsDashboardData;
}
