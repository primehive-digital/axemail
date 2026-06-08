"use client";

import { useQuery } from "@tanstack/react-query";

import { OverviewActivityCard } from "@/components/pages/overview/overview-activity-card";
import { OverviewLeaderboardCard } from "@/components/pages/overview/overview-leaderboard-card";
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
      <section className="grid gap-4 lg:grid-cols-5">
        <OverviewActivityCard />
        <OverviewLeaderboardCard />
      </section>
    </div>
  );
}