import { MetricCard } from "@/components/shared/metric-card";
import type { ResourceUsageMetric } from "@/lib/resource-usage/resource-usage-api";

const metricAssets: Record<string, { iconSrc: string; iconAlt: string; className: string }> = {
  totalGmailAccounts: {
    iconSrc: "/icons/total-gmails-icon.png",
    iconAlt: "Total Gmail accounts",
    className: "md:col-span-1",
  },
  totalDomains: {
    iconSrc: "/icons/total-domains-icon.png",
    iconAlt: "Total domains",
    className: "md:col-span-1",
  },
  totalMailboxes: {
    iconSrc: "/icons/total-mailboxes-icon.png",
    iconAlt: "Total mailboxes",
    className: "md:col-span-1",
  },
  totalServers: {
    iconSrc: "/icons/total-servers-icon.png",
    iconAlt: "Total servers",
    className: "md:col-span-1",
  },
};

const fallbackMetrics: ResourceUsageMetric[] = [
  {
    key: "totalGmailAccounts",
    title: "Total Gmail Accounts",
    label: "Gmail Accounts",
    value: 0,
    description: "Gmail SMTP accounts in the mailer pool.",
  },
  {
    key: "totalDomains",
    title: "Total Domains",
    label: "Domains",
    value: 0,
    description: "Domain SMTP accounts in the mailer pool.",
  },
  {
    key: "totalMailboxes",
    title: "Total Mailboxes",
    label: "Domain Mailboxes",
    value: 0,
    description: "Domain mailboxes in the mailer pool.",
  },
  {
    key: "totalServers",
    title: "Total Servers",
    label: "Servers",
    value: 0,
    description: "Servers used in the mailer pool.",
  },
];

function MetricSkeleton() {
  return <div className="min-h-36 rounded-xl border border-border bg-card shadow-sm shadow-black/5" />;
}

export function ResourceUsageMetrics({ metrics, isLoading }: { metrics: ResourceUsageMetric[]; isLoading?: boolean }) {
  const visibleMetrics = metrics.length > 0 ? metrics : fallbackMetrics;

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {isLoading
        ? fallbackMetrics.map((metric) => <MetricSkeleton key={metric.key} />)
        : visibleMetrics.map((metric) => {
            const asset = metricAssets[metric.key];

            return (
              <MetricCard
                key={metric.key}
                title={metric.title}
                label={metric.label}
                value={metric.value}
                description={metric.description}
                iconSrc={asset.iconSrc}
                iconAlt={asset.iconAlt}
                className={asset.className}
              />
            );
          })}
    </section>
  );
}