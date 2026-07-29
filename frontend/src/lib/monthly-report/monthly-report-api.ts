import { extractApiErrorMessage } from "@/lib/api-client";

export type MonthlyEmployeeReport = {
  userId: string;
  name: string;
  email: string;
  monthTarget: number;
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  completionRate: number;
  mailerTotals: { gmail: number; domain: number; mask: number };
};

export type MonthlySendingReport = {
  month: string;
  monthLabel: string;
  summary: {
    totalEmployees: number;
    totalSent: number;
    totalFailed: number;
    totalQueued: number;
    totalTarget: number;
  };
  employees: MonthlyEmployeeReport[];
};

export async function getMonthlySendingReport(month: string) {
  const response = await fetch(`/api/reports/employee-performance?month=${encodeURIComponent(month)}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) throw new Error(extractApiErrorMessage(payload, "Unable to load monthly report."));
  return payload.data as MonthlySendingReport;
}

export async function downloadMonthlySendingReport(month: string, format: "excel" | "pdf") {
  const params = new URLSearchParams({ month, format });
  const response = await fetch(`/api/reports/employee-performance/export?${params}`);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(payload, "Unable to download monthly report."));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `monthly-sending-${month}.${format === "excel" ? "xls" : "pdf"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
