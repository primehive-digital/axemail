import { extractApiErrorMessage } from "@/lib/api-client";

export type OverviewMetric = {
  key: "gmail" | "domain" | "mask" | "collective";
  title: string;
  sentToday: number;
  dailyLimit: number;
  remaining: number;
  progress: number;
};

export type OverviewTrendPoint = {
  date: string;
  label: string;
  gmail: number;
  domain: number;
  mask: number;
  total: number;
};

export type OverviewDashboardData = {
  scope: "personal" | "team";
  mailers: Array<OverviewMetric & { key: "gmail" | "domain" | "mask" }>;
  collective: OverviewMetric & { key: "collective" };
  trend: OverviewTrendPoint[];
};

export async function getOverviewDashboard() {
  const response = await fetch("/api/dashboard/overview", { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(payload, "Unable to load the dashboard."));
  }

  return payload.data as OverviewDashboardData;
}
