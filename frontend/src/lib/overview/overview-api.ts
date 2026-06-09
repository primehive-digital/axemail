import { extractApiErrorMessage } from "@/lib/api-client";

export type OverviewMetric = {
  key: "gmail" | "domain" | "mask" | "total";
  title: string;
  label: string;
  value: number;
  total: number;
};

export type OverviewActivity = {
  id: string;
  actorType: "employee" | "bot";
  actorName: string;
  actorEmail?: string;
  message: string;
  mailer: string;
  mailerType: "gmail" | "domain" | "mask" | "collective" | "automation";
  occurredAt: string;
  tone: "success" | "info" | "warning";
};

export type OverviewActivityFeed = {
  items: OverviewActivity[];
  generatedAt: string;
  shiftWarningActive: boolean;
};

export type OverviewLeaderboardEmployee = {
  id: string;
  name: string;
  email: string;
  progress: number;
  completed: number;
  target: number;
  remaining: number;
};

export type OverviewLeaderboard = {
  leaders: OverviewLeaderboardEmployee[];
  behind: OverviewLeaderboardEmployee[];
  generatedAt: string;
};

export type OverviewDashboardData = {
  metrics: OverviewMetric[];
  leaderboard: OverviewLeaderboard;
  activityFeed: OverviewActivityFeed;
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