"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Globe2,
  Mail,
  Send,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getOverviewDashboard,
  type OverviewMetric,
} from "@/lib/overview/overview-api";
import { cn } from "@/lib/utils";

const metricStyles = {
  gmail: {
    icon: Mail,
    iconClass: "bg-red-50 text-red-600 ring-red-100",
    barClass: "bg-red-500",
  },
  domain: {
    icon: Globe2,
    iconClass: "bg-blue-50 text-blue-600 ring-blue-100",
    barClass: "bg-blue-500",
  },
  mask: {
    icon: ShieldCheck,
    iconClass: "bg-violet-50 text-violet-600 ring-violet-100",
    barClass: "bg-violet-500",
  },
  collective: {
    icon: Send,
    iconClass: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    barClass: "bg-emerald-500",
  },
} as const;

export function OverviewDashboard() {
  const query = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getOverviewDashboard,
  });

  if (query.isLoading) return <OverviewLoading />;

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardContent className="py-10 text-center">
            <h1 className="text-xl font-semibold text-heading">Dashboard unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {query.error instanceof Error ? query.error.message : "Please try again shortly."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = query.data;
  const metrics = [...data.mailers, data.collective];
  const scopeLabel = data.scope === "team" ? "your entire team" : "your account";

  return (
    <main className="flex flex-1 flex-col gap-6 bg-secondary/20 p-4 lg:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Live daily performance
          </p>
          <h1 className="mt-1 font-google-sans text-3xl font-semibold tracking-tight text-heading">
            Delivery Overview
          </h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
            Successful deliveries and available daily capacity across {scopeLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 sm:self-auto">
          <span className="size-2 rounded-full bg-emerald-500" />
          Updated from live delivery records
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      <section className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <Card className="min-h-105">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <h2 className="font-google-sans text-xl font-semibold text-heading">
                Seven-Day Delivery Trend
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Successful Gmail, domain, and mask deliveries.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 ring-1 ring-emerald-100">
              <TrendingUp className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="h-84 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmail-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="domain-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mask-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  cursor={{ stroke: "#d1d5db", strokeDasharray: "4 4" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 12px 30px rgba(15,23,42,.08)" }}
                />
                <Area type="monotone" dataKey="gmail" name="Gmail" stroke="#ef4444" strokeWidth={2.5} fill="url(#gmail-fill)" />
                <Area type="monotone" dataKey="domain" name="Domain" stroke="#3b82f6" strokeWidth={2.5} fill="url(#domain-fill)" />
                <Area type="monotone" dataKey="mask" name="Mask" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#mask-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-h-105">
          <CardHeader>
            <h2 className="font-google-sans text-xl font-semibold text-heading">
              Mailer Progress Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              Sent today against available daily capacity.
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-6">
            {data.mailers.map((metric) => (
              <ProgressRow key={metric.key} metric={metric} />
            ))}
            <div className="mt-auto rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Collective progress</p>
                  <p className="digits mt-2 text-3xl font-semibold">
                    {data.collective.sentToday.toLocaleString()}
                    <span className="ml-1 text-base font-normal text-slate-400">
                      / {data.collective.dailyLimit.toLocaleString()}
                    </span>
                  </p>
                </div>
                <span className="digits rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
                  {data.collective.progress}%
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
                  style={{ width: `${Math.min(data.collective.progress, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function MetricCard({ metric }: { metric: OverviewMetric }) {
  const style = metricStyles[metric.key];
  const Icon = style.icon as ComponentType<{ className?: string }>;

  return (
    <Card className="gap-5 transition-transform duration-200 hover:-translate-y-0.5">
      <CardHeader className="flex-row items-start justify-between">
        <div className={cn("rounded-xl p-2.5 ring-1", style.iconClass)}>
          <Icon className="size-5" />
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          Sent today
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold text-heading">{metric.title}</p>
        <div className="mt-3 flex items-baseline gap-1.5">
          <strong className="digits text-4xl font-semibold tracking-tight text-heading">
            {metric.sentToday.toLocaleString()}
          </strong>
          <span className="digits text-base text-muted-foreground">
            / {metric.dailyLimit.toLocaleString()}
          </span>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", style.barClass)}
            style={{ width: `${Math.min(metric.progress, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{metric.remaining.toLocaleString()} remaining</span>
          <span className="digits font-medium text-heading">{metric.progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressRow({ metric }: { metric: OverviewMetric }) {
  const style = metricStyles[metric.key];
  const Icon = style.icon as ComponentType<{ className?: string }>;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={cn("rounded-lg p-2 ring-1", style.iconClass)}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold text-heading">{metric.title.replace("Mails via ", "")}</span>
            <span className="digits text-sm font-semibold">{metric.progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full transition-[width] duration-500", style.barClass)}
              style={{ width: `${Math.min(metric.progress, 100)}%` }}
            />
          </div>
          <p className="digits mt-1.5 text-xs text-muted-foreground">
            {metric.sentToday.toLocaleString()} sent of {metric.dailyLimit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function OverviewLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="h-16 w-80 animate-pulse rounded-2xl bg-secondary" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-52 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
      <div className="grid flex-1 gap-4 xl:grid-cols-[1.55fr_0.75fr]">
        <div className="min-h-105 animate-pulse rounded-2xl bg-secondary" />
        <div className="min-h-105 animate-pulse rounded-2xl bg-secondary" />
      </div>
    </div>
  );
}
