"use client";

import { useQuery } from "@tanstack/react-query";

import { OverviewMetrics } from "@/components/pages/overview/overview-metrics";
import { getOverviewDashboard } from "@/lib/overview/overview-api";

const queryKey = ["overview-dashboard"];

export function OverviewDashboard() {
  const query = useQuery({
    queryKey,
    queryFn: getOverviewDashboard,
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <OverviewMetrics metrics={query.data?.metrics ?? []} isLoading={query.isLoading} />
    </div>
  );
}