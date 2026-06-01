import { MetricCard } from "@/components/shared/metric-card";

const resourceUsageMetrics = [
  {
    title: "Total Gmail Accounts",
    label: "Gmail Accounts",
    value: 48,
    description: "Gmail mailboxes in the mailer pool.",
    iconSrc: "/icons/total-gmails-icon.png",
    iconAlt: "Total Gmail accounts",
    className: "md:col-span-1",
  },
  {
    title: "Total Domains",
    label: "Domains",
    value: 12,
    description: "Domains used for mailboxes in the mailer pool.",
    iconSrc: "/icons/total-domains-icon.png",
    iconAlt: "Total domains",
    className: "md:col-span-1",
  },
  {
    title: "Total Mailboxes",
    label: "Domain Mailboxes",
    value: 156,
    description: "Mailboxes used in the mailer pool.",
    iconSrc: "/icons/total-mailboxes-icon.png",
    iconAlt: "Total mailboxes",
    className: "md:col-span-1",
  },
  {
    title: "Total Servers",
    label: "Servers",
    value: 8,
    description: "Servers used in the mailer pool.",
    iconSrc: "/icons/total-servers-icon.png",
    iconAlt: "Total servers",
    className: "md:col-span-1",
  },
];

export function ResourceUsageMetrics() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {resourceUsageMetrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </section>
  );
}
