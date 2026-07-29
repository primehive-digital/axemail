"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getMyUsage } from "@/lib/my-usage/my-usage-api";

const labels = { gmail: "Gmail Sender", domain: "Domain Sender", mask: "Mask Sender" } as const;

export function MyLimitsDashboard() {
  const query = useQuery({ queryKey: ["my-sender-limits"], queryFn: getMyUsage });
  const quotas = query.data?.mailerQuotas ?? [];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6">
      <div>
        <h1 className="font-google-sans text-2xl font-semibold text-heading">My Sending Limits</h1>
        <p className="mt-1 font-inter text-sm text-muted-foreground">Today&apos;s assigned, used, and remaining capacity across all three senders.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {quotas.map((quota) => (
          <Card key={quota.type}>
            <CardHeader><h2 className="font-google-sans text-lg font-semibold">{labels[quota.type]}</h2></CardHeader>
            <CardContent className="space-y-3">
              <LimitRow label="Assigned today" value={quota.assignedLimit} />
              <LimitRow label="Sent/queued today" value={quota.used} />
              <LimitRow label="Remaining today" value={quota.remaining} emphasize />
            </CardContent>
          </Card>
        ))}
        {query.isLoading && <p className="text-sm text-muted-foreground">Loading your limits…</p>}
      </section>
    </div>
  );
}

function LimitRow({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"><span className="text-sm text-muted-foreground">{label}</span><strong className={`digits text-xl ${emphasize ? "text-blue-600" : "text-heading"}`}>{value.toLocaleString()}</strong></div>;
}
