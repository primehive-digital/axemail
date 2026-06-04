import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MailerProgressCard } from "./mailer-progress-card";
import { MAILER_TYPE } from "@/constants/enum";
import type { ActivityProgressItem } from "@/lib/activity-insights/activity-insights-api";

const mailerProgressMeta: Record<string, { logoSrc: string; logoAlt: string }> = {
  [MAILER_TYPE.GMAIL]: {
    logoSrc: "/icons/gmail-allocation-logo.png",
    logoAlt: "Gmail mailer progress",
  },
  [MAILER_TYPE.DOMAIN]: {
    logoSrc: "/icons/domain-allocation-logo.png",
    logoAlt: "Domain mailer progress",
  },
  [MAILER_TYPE.MASK]: {
    logoSrc: "/icons/mask-allocation-logo.png",
    logoAlt: "Mask mailer progress",
  },
  total: {
    logoSrc: "/icons/total-allocation-logo.png",
    logoAlt: "Total mailer progress",
  },
};

const fallbackMetrics: ActivityProgressItem[] = [
  {
    mailerType: MAILER_TYPE.GMAIL,
    title: "Gmail Mailer Progress",
    description: "Gmail mailer activity against the assigned daily target.",
    sent: 0,
    target: 0,
    percentage: 0,
  },
  {
    mailerType: MAILER_TYPE.DOMAIN,
    title: "Domain Mailer Progress",
    description: "Domain mailer activity against the assigned daily target.",
    sent: 0,
    target: 0,
    percentage: 0,
  },
  {
    mailerType: MAILER_TYPE.MASK,
    title: "Mask Mailer Progress",
    description: "Mask mailer activity against the assigned daily target.",
    sent: 0,
    target: 0,
    percentage: 0,
  },
  {
    mailerType: "total",
    title: "Total Mailer Progress",
    description: "Combined activity across all assigned mailer limits today.",
    sent: 0,
    target: 0,
    percentage: 0,
  },
];

function ProgressSkeletonCard() {
  return <div className="min-h-52 rounded-xl border border-border bg-card shadow-sm shadow-black/5" />;
}

export function ActivityProgressSection({
  metrics,
  isLoading,
  isRefreshing,
  onRefresh,
}: {
  metrics: ActivityProgressItem[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
}) {
  const visibleMetrics = metrics.length > 0 ? metrics : fallbackMetrics;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Activity Insights</h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
            Track today&apos;s sending progress and employee performance across assigned mailer limits.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isRefreshing}
          className="h-10 rounded-full px-4 font-google-sans shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-secondary hover:shadow-md hover:shadow-black/20"
          onClick={onRefresh}
        >
          Refresh data
          {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {isLoading
          ? fallbackMetrics.map((metric) => <ProgressSkeletonCard key={metric.mailerType} />)
          : visibleMetrics.map((metric) => {
              const meta = mailerProgressMeta[metric.mailerType];

              return <MailerProgressCard key={metric.mailerType} {...metric} logoSrc={meta.logoSrc} logoAlt={meta.logoAlt} />;
            })}
      </div>
    </section>
  );
}