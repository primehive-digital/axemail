import { MetricCard } from "@/components/shared/metric-card";

const userManagementMetrics = [
  {
    title: "Total Users",
    label: "Accounts",
    value: 6,
    iconSrc: "/icons/total-users-icon.png",
    iconAlt: "Total users",
  },
  {
    title: "Active Sessions",
    label: "Live",
    value: 4,
    iconSrc: "/icons/active-sessions-icon.png",
    iconAlt: "Active sessions",
  },
  {
    title: "Total Managers",
    label: "Managers",
    value: 2,
    iconSrc: "/icons/total-managers-icon.png",
    iconAlt: "Total managers",
  },
  {
    title: "Total Employees",
    label: "Employees",
    value: 4,
    iconSrc: "/icons/total-employees-icon.png",
    iconAlt: "Total employees",
  },
];

export function UserManagementMetrics() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {userManagementMetrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </section>
  );
}
