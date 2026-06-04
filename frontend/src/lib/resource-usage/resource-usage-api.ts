import { extractApiErrorMessage } from "@/lib/api-client";

export type ResourceUsageMetric = {
  key: string;
  title: string;
  label: string;
  value: number;
  description: string;
};

export type ResourceLimit = {
  key: "gmail" | "domain" | "mask";
  resource: string;
  description: string;
  perAccount: number;
  perDay: number;
  perMonth: number;
  officeDaysPerMonth: number;
};

export type ResourceUsageDashboardData = {
  metrics: ResourceUsageMetric[];
  limits: ResourceLimit[];
};

export async function getResourceUsageDashboard() {
  return requestJson<ResourceUsageDashboardData>("/api/dashboard/resource-usage");
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