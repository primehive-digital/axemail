"use client";

import { useQuery } from "@tanstack/react-query";

import { ResourceLimitTableCard } from "@/components/pages/analytics/resource-usage/resource-limit-table-card";
import { ResourceUsageMetrics } from "@/components/pages/analytics/resource-usage/resource-usage-metrics";
import { getResourceUsageDashboard } from "@/lib/resource-usage/resource-usage-api";

const queryKey = ["resource-usage-dashboard"];

export function ResourceUsageDashboard() {
  const query = useQuery({
    queryKey,
    queryFn: getResourceUsageDashboard,
  });

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="space-y-4">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Resource Usage</h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
            Monitor Gmail accounts, domain mailboxes, and server capacity across the mailer pool.
          </p>
        </div>

        <ResourceUsageMetrics metrics={query.data?.metrics ?? []} isLoading={query.isLoading} />
      </section>

      <ResourceLimitTableCard limits={query.data?.limits ?? []} isLoading={query.isLoading} />
    </div>
  );
}