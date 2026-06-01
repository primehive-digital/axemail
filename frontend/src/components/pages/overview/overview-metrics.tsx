"use client";

import { MetricCard } from "@/components/shared/metric-card";
import { useDashboardSidebar } from "@/hooks/use-dashboard-sidebar";
import { cn } from "@/lib/utils";

const overviewMetrics = [
  {
    title: "Mails via Gmail Mailer",
    label: "Sent Today",
    value: 20,
    total: 100,
    iconSrc: "/icons/gmail-logo.png",
    iconAlt: "Gmail Mailer",
  },
  {
    title: "Mails via Domain Mailer",
    label: "Sent Today",
    value: 34,
    total: 100,
    iconSrc: "/icons/domain-logo.png",
    iconAlt: "Domain Mailer",
  },
  {
    title: "Mails via Mask Mailer",
    label: "Sent Today",
    value: 18,
    total: 100,
    iconSrc: "/icons/mask-logo.png",
    iconAlt: "Mask Mailer",
  },
  {
    title: "Collective Mail Delivery",
    label: "Sent Today",
    value: 72,
    total: 300,
    iconSrc: "/icons/total-logo.png",
    iconAlt: "Collective Mail Delivery",
  },
];

export function OverviewMetrics() {
  const { isDashboardSidebarOpen } = useDashboardSidebar();

  return (
    <section
      className={cn(
        "grid gap-4 transition-[grid-template-columns] duration-300 ease-linear md:grid-cols-2",
        isDashboardSidebarOpen && "md:max-lg:grid-cols-1"
      )}
    >
      {overviewMetrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </section>
  );
}
