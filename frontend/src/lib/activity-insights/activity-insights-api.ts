import { extractApiErrorMessage } from "@/lib/api-client";
import type { MailerType, UserRole } from "@/constants/enum";

export type ActivityProgressItem = {
  mailerType: MailerType | "total";
  title: string;
  description: string;
  sent: number;
  target: number;
  percentage: number;
};

export type ActivityUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ActivityMailerRatio = {
  sent: number;
  target: number;
};

export type ProgressTrackerRow = {
  user: ActivityUser;
  gmail: ActivityMailerRatio;
  domain: ActivityMailerRatio;
  mask: ActivityMailerRatio;
  total: ActivityMailerRatio;
};

export type PerformanceReportEmployee = {
  userId: string;
  name: string;
  pseudoName: string;
  email: string;
  dailyTarget: number;
  monthTarget: number;
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  remainingTarget: number;
  completionRate: number;
  isTargetMet: boolean;
  inactiveDays: number;
  mailerTargets: Record<MailerType, number>;
  mailerTotals: Record<MailerType, number>;
};

export type PerformanceReport = {
  month: string;
  monthLabel: string;
  generatedAt: string;
  range: {
    start: string;
    end: string;
    endExclusive: string;
    daysTracked: number;
    daysInMonth: number;
    trackedDates: string[];
  };
  availability: {
    start: string;
    end: string;
    months: string[];
  };
  summary: {
    totalEmployees: number;
    totalSent: number;
    totalFailed: number;
    totalQueued: number;
    totalTarget: number;
    targetMetEmployees: number;
    behindTargetEmployees: number;
    inactiveEmployees: number;
  };
  employees: PerformanceReportEmployee[];
};

export type ActivityInsightsDashboardData = {
  role: UserRole;
  progress: ActivityProgressItem[];
  tracker: ProgressTrackerRow[];
  performance: PerformanceReport | null;
};

export type ActivityInsightsQuery = {
  startDate?: string;
  endDate?: string;
};

export async function getActivityInsightsDashboard(input: ActivityInsightsQuery) {
  return requestJson<ActivityInsightsDashboardData>(`/api/dashboard/activity-insights${toSearchParams(input)}`);
}

export async function downloadEmployeePerformanceReport(input: ActivityInsightsQuery & { format: "excel" | "pdf" }) {
  const response = await fetch(`/api/reports/employee-performance/export${toSearchParams(input)}`);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(payload, "Unable to download report."));
  }

  const blob = await response.blob();
  const filename = getFilename(response.headers.get("Content-Disposition"), input.format);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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

function toSearchParams(input: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function getFilename(contentDisposition: string | null, format: "excel" | "pdf") {
  const fallback = `employee-performance-report.${format === "excel" ? "xls" : "pdf"}`;

  if (!contentDisposition) {
    return fallback;
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/);
  return match?.[1] ?? fallback;
}