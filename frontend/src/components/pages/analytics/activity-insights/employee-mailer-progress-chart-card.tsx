"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MAILER_TYPE } from "@/constants/enum";
import type { ActivityProgressItem } from "@/lib/activity-insights/activity-insights-api";

const chartHeight = 300;
const targetFill = "#e8edf3";
const sentFill = "#eab308";
const axisFill = "#111827";
const gridStroke = "#dde5ee";

const fallbackMetrics = [
  {
    mailerType: MAILER_TYPE.GMAIL,
    title: "Gmail Mailer Progress",
    description: "",
    sent: 0,
    target: 0,
    percentage: 0,
  },
  {
    mailerType: MAILER_TYPE.DOMAIN,
    title: "Domain Mailer Progress",
    description: "",
    sent: 0,
    target: 0,
    percentage: 0,
  },
  {
    mailerType: MAILER_TYPE.MASK,
    title: "Mask Mailer Progress",
    description: "",
    sent: 0,
    target: 0,
    percentage: 0,
  },
] satisfies ActivityProgressItem[];

function getMailerMetrics(metrics: ActivityProgressItem[]) {
  const visibleMetrics = metrics.filter(
    (metric) => metric.mailerType === MAILER_TYPE.GMAIL || metric.mailerType === MAILER_TYPE.DOMAIN || metric.mailerType === MAILER_TYPE.MASK,
  );

  return visibleMetrics.length > 0 ? visibleMetrics : fallbackMetrics;
}

function formatMailerLabel(mailerType: ActivityProgressItem["mailerType"]) {
  if (mailerType === MAILER_TYPE.GMAIL) return "Gmail";
  if (mailerType === MAILER_TYPE.DOMAIN) return "Domain";
  return "Mask";
}

function buildChartData(metrics: ActivityProgressItem[]) {
  return getMailerMetrics(metrics).map((metric) => ({
    mailer: formatMailerLabel(metric.mailerType),
    target: metric.target,
    sent: metric.sent,
  }));
}

function TooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  const target = payload.find((item) => item.dataKey === "target")?.value ?? 0;
  const sent = payload.find((item) => item.dataKey === "sent")?.value ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md shadow-black/10">
      <p className="font-google-sans text-sm font-semibold text-heading">{label}</p>
      <div className="mt-2 space-y-1 font-inter text-xs text-muted-foreground">
        <p>Target: <span className="digits text-heading">{target.toLocaleString()}</span></p>
        <p>Sent: <span className="digits text-heading">{sent.toLocaleString()}</span></p>
      </div>
    </div>
  );
}

export function EmployeeMailerProgressChartCard({ metrics, isLoading }: { metrics: ActivityProgressItem[]; isLoading?: boolean }) {
  const chartData = buildChartData(metrics);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Mailer Progress Breakdown</h2>
            <p className="font-inter text-sm text-muted-foreground">
              Compare your sent volume against assigned targets by mailer type.
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
            <BarChart3 className="size-4" />
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="mb-5 flex items-center gap-5 font-inter text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: targetFill }} />
            Target
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: sentFill }} />
            Sent
          </span>
        </div>

        <div className="h-72 w-full rounded-xl border border-border bg-secondary/50 p-4">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} barCategoryGap={34} barGap={-42} margin={{ top: 18, right: 20, bottom: 28, left: 0 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="0" />
              <XAxis
                dataKey="mailer"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisFill, fontSize: 13, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisFill, fontSize: 12, fontWeight: 600 }}
                allowDecimals={false}
              />
              <Tooltip cursor={false} content={<TooltipContent />} />
              <Bar dataKey="target" fill={targetFill} radius={[16, 16, 0, 0]} barSize={54} animationDuration={350} />
              <Bar dataKey="sent" fill={sentFill} radius={[14, 14, 0, 0]} barSize={30} animationDuration={350} className={isLoading ? "animate-pulse" : undefined}>
                <LabelList
                  dataKey="sent"
                  position="top"
                  className="digits fill-heading text-xs font-semibold"
                  formatter={(value) => (typeof value === "number" ? value.toLocaleString() : "")}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}