import { extractApiErrorMessage } from "@/lib/api-client";

export type OverviewMetric = {
  key: "gmail" | "domain" | "mask" | "total";
  title: string;
  label: string;
  value: number;
  total: number;
};

export type OverviewDashboardData = {
  metrics: OverviewMetric[];
};

export async function getOverviewDashboard() {
  return requestJson<OverviewDashboardData>("/api/dashboard/overview");
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