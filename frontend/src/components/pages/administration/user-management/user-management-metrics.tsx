import { MetricCard } from "@/components/shared/metric-card";
import type { UserManagementMetric } from "@/lib/user-management/user-management-api";

const metricOrder = ["totalUsers", "totalManagers", "totalEmployees"];

const metricIcons: Record<string, { iconSrc: string; iconAlt: string; badgeTone: "blue" | "emerald" | "violet" | "amber" }> = {
  totalUsers: {
    iconSrc: "/icons/total-users-icon.png",
    iconAlt: "Total users",
    badgeTone: "blue",
  },
  totalManagers: {
    iconSrc: "/icons/total-managers-icon.png",
    iconAlt: "Total managers",
    badgeTone: "violet",
  },
  totalEmployees: {
    iconSrc: "/icons/total-employees-icon.png",
    iconAlt: "Total employees",
    badgeTone: "emerald",
  },
};

export function UserManagementMetrics({ metrics }: { metrics: UserManagementMetric[] }) {
  const visibleMetrics = [...metrics].sort(
    (left, right) => metricOrder.indexOf(left.key) - metricOrder.indexOf(right.key),
  );

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {visibleMetrics.map((metric) => {
        const icon = metricIcons[metric.key] ?? metricIcons.totalUsers;

        return (
          <MetricCard
            key={metric.key}
            title={metric.title}
            label={metric.label}
            value={metric.value}
            iconSrc={icon.iconSrc}
            iconAlt={icon.iconAlt}
            badgeTone={icon.badgeTone}
          />
        );
      })}
    </section>
  );
}
