"use client";

import { MetricCard } from "@/components/shared/metric-card";
import { useDashboardSidebar } from "@/hooks/use-dashboard-sidebar";
import { cn } from "@/lib/utils";
import type { OverviewMetric } from "@/lib/overview/overview-api";

const metricMeta: Record<OverviewMetric["key"], { iconSrc: string; iconAlt: string }> = {
  gmail: {
    iconSrc: "/icons/gmail-logo.png",
    iconAlt: "Gmail Mailer",
  },
  domain: {
    iconSrc: "/icons/domain-logo.png",
    iconAlt: "Domain Mailer",
  },
  mask: {
    iconSrc: "/icons/mask-logo.png",
    iconAlt: "Mask Mailer",
  },
  total: {
    iconSrc: "/icons/total-logo.png",
    iconAlt: "Collective Mail Delivery",
  },
};

const fallbackMetrics: OverviewMetric[] = [
  {
    key: "gmail",
    title: "Mails via Gmail Mailer",
    label: "Sent Today",
    value: 0,
    total: 0,
  },
  {
    key: "domain",
    title: "Mails via Domain Mailer",
    label: "Sent Today",
    value: 0,
    total: 0,
  },
  {
    key: "mask",
    title: "Mails via Mask Mailer",
    label: "Sent Today",
    value: 0,
    total: 0,
  },
  {
    key: "total",
    title: "Collective Mail Delivery",
    label: "Sent Today",
    value: 0,
    total: 0,
  },
];

function MetricSkeletonCard() {
  return <div className="min-h-36 rounded-xl border border-border bg-card shadow-sm shadow-black/5" />;
}

export function OverviewMetrics({ metrics, isLoading }: { metrics: OverviewMetric[]; isLoading?: boolean }) {
  const { isDashboardSidebarOpen } = useDashboardSidebar();
  const visibleMetrics = metrics.length > 0 ? metrics : fallbackMetrics;

  return (
    <section
      className={cn(
        "grid gap-4 transition-[grid-template-columns] duration-300 ease-linear md:grid-cols-2",
        isDashboardSidebarOpen && "md:max-lg:grid-cols-1",
      )}
    >
      {isLoading
        ? fallbackMetrics.map((metric) => <MetricSkeletonCard key={metric.key} />)
        : visibleMetrics.map((metric) => {
            const meta = metricMeta[metric.key];
            const { key, ...metricProps } = metric;

            return <MetricCard key={key} {...metricProps} iconSrc={meta.iconSrc} iconAlt={meta.iconAlt} />;
          })}
    </section>
  );
}