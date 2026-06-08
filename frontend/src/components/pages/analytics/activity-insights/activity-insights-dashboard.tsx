"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import toast from "react-hot-toast";

import { ActivityProgressSection } from "@/components/pages/analytics/activity-insights/activity-progress-section";
import {
  botProgressTrackerRows,
  getBotPerformanceReport,
} from "@/components/pages/analytics/activity-insights/bot-activity-insights-data";
import { BotPerformanceTableCard } from "@/components/pages/analytics/activity-insights/bot-performance-table-card";
import { downloadBotPerformanceReport } from "@/components/pages/analytics/activity-insights/bot-performance-report-utils";
import { BotProgressTrackerTableCard } from "@/components/pages/analytics/activity-insights/bot-progress-tracker-table-card";
import { EmployeeMailerProgressChartCard } from "@/components/pages/analytics/activity-insights/employee-mailer-progress-chart-card";
import { EmployeePerformanceTableCard } from "@/components/pages/analytics/activity-insights/employee-performance-table-card";
import { ProgressTrackerTableCard } from "@/components/pages/analytics/activity-insights/progress-tracker-table-card";
import { USER_ROLE } from "@/constants/enum";
import {
  downloadEmployeePerformanceReport,
  getActivityInsightsDashboard,
  type ActivityInsightsQuery,
} from "@/lib/activity-insights/activity-insights-api";
import { useAppSelector } from "@/store/hooks";

const queryKey = "activity-insights-dashboard";

function getInitialDateRange(): DateRange {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: now,
  };
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildActivityQuery(dateRange: DateRange | undefined): ActivityInsightsQuery {
  if (!dateRange?.from || !dateRange.to) {
    return {};
  }

  return {
    startDate: toDateKey(dateRange.from),
    endDate: toDateKey(dateRange.to),
  };
}

export function ActivityInsightsDashboard() {
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => getInitialDateRange());
  const queryInput = useMemo(() => buildActivityQuery(dateRange), [dateRange]);
  const botPerformanceReport = useMemo(() => getBotPerformanceReport(dateRange), [dateRange]);
  const query = useQuery({
    queryKey: [queryKey, queryInput.startDate, queryInput.endDate],
    queryFn: () => getActivityInsightsDashboard(queryInput),
  });
  const downloadMutation = useMutation({
    mutationFn: (format: "excel" | "pdf") => downloadEmployeePerformanceReport({ ...queryInput, format }),
    onSuccess: () => toast.success("Report download started."),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to download report."),
  });
  const activeRole = query.data?.role ?? currentUserRole;
  const isEmployee = activeRole === USER_ROLE.EMPLOYEE;
  const handleBotPerformanceDownload = (format: "excel" | "pdf") => {
    try {
      if (format === "excel") {
        downloadBotPerformanceReport(botPerformanceReport, "excel");
      } else {
        downloadBotPerformanceReport(botPerformanceReport, "pdf");
      }

      toast.success("Bot report download started.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download bot report.");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <ActivityProgressSection
        metrics={query.data?.progress ?? []}
        isLoading={query.isLoading}
        isRefreshing={query.isFetching && !query.isLoading}
        onRefresh={() => query.refetch()}
      />

      {isEmployee && <EmployeeMailerProgressChartCard metrics={query.data?.progress ?? []} isLoading={query.isLoading} />}

      {activeRole && !isEmployee && (
        <>
          <ProgressTrackerTableCard rows={query.data?.tracker ?? []} isLoading={query.isLoading} />
          <BotProgressTrackerTableCard rows={botProgressTrackerRows} />
          <EmployeePerformanceTableCard
            report={query.data?.performance ?? null}
            dateRange={dateRange}
            isLoading={query.isLoading}
            isDownloading={downloadMutation.isPending}
            onDateRangeChange={setDateRange}
            onDownload={(format) => downloadMutation.mutate(format)}
          />
          <BotPerformanceTableCard
            report={botPerformanceReport}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onDownload={handleBotPerformanceDownload}
          />
        </>
      )}
    </div>
  );
}