import { ActivityProgressSection } from "@/components/pages/analytics/activity-insights/activity-progress-section";
import { EmployeePerformanceTableCard } from "@/components/pages/analytics/activity-insights/employee-performance-table-card";
import { ProgressTrackerTableCard } from "@/components/pages/analytics/activity-insights/progress-tracker-table-card";

export function ActivityInsightsDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <ActivityProgressSection />
      <ProgressTrackerTableCard />
      <EmployeePerformanceTableCard />
    </div>
  );
}
