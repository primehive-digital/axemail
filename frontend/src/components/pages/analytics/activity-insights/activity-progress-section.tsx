import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MailerProgressCard } from "./mailer-progress-card";

const mailerProgressMetrics = [
  {
    title: "Gmail Mailer Progress",
    description: "Today's Gmail sender activity against the daily target.",
    logoSrc: "/icons/gmail-allocation-logo.png",
    logoAlt: "Gmail mailer progress",
    sent: 68,
    target: 100,
  },
  {
    title: "Domain Mailer Progress",
    description: "Today's domain mailbox activity against the daily target.",
    logoSrc: "/icons/domain-allocation-logo.png",
    logoAlt: "Domain mailer progress",
    sent: 142,
    target: 250,
  },
  {
    title: "Mask Mailer Progress",
    description: "Today's mask sender activity against the daily target.",
    logoSrc: "/icons/mask-allocation-logo.png",
    logoAlt: "Mask mailer progress",
    sent: 96,
    target: 150,
  },
  {
    title: "Total Mailer Progress",
    description: "Combined sending activity across all mailer pools today.",
    logoSrc: "/icons/total-allocation-logo.png",
    logoAlt: "Total mailer progress",
    sent: 306,
    target: 500,
  },
];

export function ActivityProgressSection() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">
            Activity Insights
          </h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
            Track today&apos;s / Monthly sending progress across Gmail, domain,
            mask, and total mailer pools.
          </p>
        </div>

        <Button
          variant="outline"
          className="h-10 rounded-full px-4 font-google-sans shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-secondary hover:shadow-md hover:shadow-black/20"
        >
          Refresh data
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {mailerProgressMetrics.map((metric) => (
          <MailerProgressCard key={metric.title} {...metric} />
        ))}
      </div>
    </section>
  );
}
