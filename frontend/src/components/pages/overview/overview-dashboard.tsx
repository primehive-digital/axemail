import { OverviewMetrics } from "@/components/pages/overview/overview-metrics";

export function OverviewDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <OverviewMetrics />
    </div>
  );
}
