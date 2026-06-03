import { MetricCard } from "@/components/shared/metric-card";
import type { UserManagementMetric } from "@/lib/user-management/user-management-api";

const metricIcons: Record<string, { iconSrc: string; iconAlt: string }> = {
  totalUsers: {
    iconSrc: "/icons/total-users-icon.png",
    iconAlt: "Total users",
  },
  activeSessions: {
    iconSrc: "/icons/active-sessions-icon.png",
    iconAlt: "Active sessions",
  },
  totalManagers: {
    iconSrc: "/icons/total-managers-icon.png",
    iconAlt: "Total managers",
  },
  totalEmployees: {
    iconSrc: "/icons/total-employees-icon.png",
    iconAlt: "Total employees",
  },
};

export function UserManagementMetrics({ metrics }: { metrics: UserManagementMetric[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.key}
          title={metric.title}
          label={metric.label}
          value={metric.value}
          iconSrc={metricIcons[metric.key]?.iconSrc ?? "/icons/total-users-icon.png"}
          iconAlt={metricIcons[metric.key]?.iconAlt ?? metric.title}
        />
      ))}
    </section>
  );
}