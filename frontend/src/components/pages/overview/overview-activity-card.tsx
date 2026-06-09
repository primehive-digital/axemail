"use client";

import { useMemo, useState } from "react";
import { BellRing, Bot, CheckCircle2, ChevronLeft, ChevronRight, MailCheck, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OverviewActivity, OverviewActivityFeed } from "@/lib/overview/overview-api";
import { cn } from "@/lib/utils";

const rowsPerPage = 4;
const emptyActivities: OverviewActivity[] = [];

const activityToneMeta = {
  success: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  info: { icon: MailCheck, className: "bg-blue-50 text-blue-700 border-blue-200" },
  warning: { icon: ShieldCheck, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

const actorIconMeta = {
  employee: UserRound,
  bot: Bot,
};

const mailerBadgeMeta = {
  gmail: "bg-red-50 text-red-700 border-red-200",
  domain: "bg-sky-50 text-sky-700 border-sky-200",
  mask: "bg-violet-50 text-violet-700 border-violet-200",
  collective: "bg-emerald-50 text-emerald-700 border-emerald-200",
  automation: "bg-blue-50 text-blue-700 border-blue-200",
};

export function OverviewActivityCard({ activityFeed }: { activityFeed?: OverviewActivityFeed }) {
  const [page, setPage] = useState(1);
  const activities = activityFeed?.items ?? emptyActivities;
  const pageCount = Math.max(Math.ceil(activities.length / rowsPerPage), 1);
  const activePage = Math.min(page, pageCount);
  const visibleActivities = useMemo(() => {
    const start = (activePage - 1) * rowsPerPage;
    return activities.slice(start, start + rowsPerPage);
  }, [activePage, activities]);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0 lg:col-span-3">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Activity Feed</h2>
            <p className="font-inter text-sm text-muted-foreground">Live quota milestones and shift-end alerts across the workspace.</p>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-heading">
            <BellRing className="size-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="min-h-97.5 divide-y divide-border">
          {visibleActivities.length === 0 ? (
            <div className="flex min-h-97.5 items-center justify-center px-5 text-center font-inter text-sm leading-6 text-muted-foreground">
              No quota activity yet. Completion and shift-end alerts will appear here automatically as employees send mail.
            </div>
          ) : (
            visibleActivities.map((activity) => <ActivityRow key={activity.id} activity={activity} />)
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <Button type="button" variant="outline" size="icon-sm" aria-label="Previous activity page" disabled={activePage === 1} className="border-none bg-transparent" onClick={() => setPage((value) => Math.max(value - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="grid size-8 place-items-center rounded-sm bg-black font-google-sans text-sm font-semibold text-white">{activePage}</span>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Next activity page" disabled={activePage === pageCount} className="border-none bg-transparent" onClick={() => setPage((value) => Math.min(value + 1, pageCount))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: OverviewActivity }) {
  const ActorIcon = actorIconMeta[activity.actorType];
  const tone = activityToneMeta[activity.tone];
  const ToneIcon = tone.icon;
  const mailerClassName = mailerBadgeMeta[activity.mailerType];

  return (
    <div className="flex gap-4 px-5 py-4 transition-colors hover:bg-secondary/40">
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
        <ActorIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-google-sans text-sm font-semibold text-heading">{activity.actorName}</span>
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-inter text-xs font-medium", tone.className)}>
            <ToneIcon className="size-3.5" />
            {activity.tone === "warning" ? "Alert" : "Milestone"}
          </span>
          <span className={cn("inline-flex rounded-full border px-2.5 py-1 font-inter text-xs font-medium", mailerClassName)}>
            {activity.mailer}
          </span>
        </div>
        {activity.actorEmail && <p className="mt-1 truncate font-inter text-xs text-muted-foreground">{activity.actorEmail}</p>}
        <p className="mt-2 font-inter text-sm leading-6 text-heading">{activity.message}</p>
      </div>
      <span className="shrink-0 font-inter text-xs text-muted-foreground">{formatActivityTime(activity.occurredAt)}</span>
    </div>
  );
}

function formatActivityTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "-";
  }

  const diffSeconds = Math.max(Math.floor((Date.now() - timestamp) / 1000), 0);

  if (diffSeconds < 60) {
    return "now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  return `${Math.floor(diffHours / 24)} d ago`;
}