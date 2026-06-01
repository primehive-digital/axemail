import { ResourceLimitTableCard } from "@/components/pages/analytics/resource-usage/resource-limit-table-card";
import { ResourceUsageMetrics } from "@/components/pages/analytics/resource-usage/resource-usage-metrics";

export function ResourceUsageDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="space-y-4">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">
            Resource Usage
          </h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
            Monitor available Gmail accounts, domains, mailboxes, and server
            capacity across the mailer pool.
          </p>
        </div>

        <ResourceUsageMetrics />
      </section>

      <ResourceLimitTableCard />
    </div>
  );
}
