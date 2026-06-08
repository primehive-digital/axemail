"use client";

import { useMemo, useState } from "react";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { BotProgressTrackerRow } from "@/components/pages/analytics/activity-insights/bot-activity-insights-data";
import { cn } from "@/lib/utils";

const rowsPerPage = 5;

function ProgressValue({ sent, target, className }: { sent: number; target: number; className?: string }) {
  return (
    <span className={cn("digits text-lg font-medium text-heading", className)}>
      {sent.toLocaleString()}
      <span className="mx-1 text-sm font-medium text-muted-foreground">/</span>
      <span className="text-sm font-medium text-muted-foreground">{target.toLocaleString()}</span>
    </span>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={5} className="h-72 px-5 py-10 text-center font-inter text-sm text-muted-foreground">
        No bot progress is available for today.
      </td>
    </tr>
  );
}

export function BotProgressTrackerTableCard({ rows }: { rows: BotProgressTrackerRow[] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(Math.ceil(rows.length / rowsPerPage), 1);
  const currentPage = Math.min(page, pageCount);
  const visibleProgress = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [currentPage, rows]);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">Bot Progress Tracker</h2>
          <p className="font-inter text-sm text-muted-foreground">
            Review each bot&apos;s sent volume against its assigned daily limits.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-200 border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bot</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gmail</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mask</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domain</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleProgress.length === 0 ? (
                <EmptyRow />
              ) : (
                visibleProgress.map((row) => (
                  <tr key={row.bot.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                          <Bot className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm font-medium leading-tight text-heading">{row.bot.name}</span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">{row.bot.pseudoName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><ProgressValue sent={row.gmail.sent} target={row.gmail.target} /></td>
                    <td className="px-5 py-4"><ProgressValue sent={row.mask.sent} target={row.mask.target} /></td>
                    <td className="px-5 py-4"><ProgressValue sent={row.domain.sent} target={row.domain.target} /></td>
                    <td className="px-5 py-4"><ProgressValue sent={row.total.sent} target={row.total.target} className="font-semibold! text-blue-600" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" disabled={currentPage === 1} className="border-none bg-transparent" onClick={() => setPage((value) => Math.max(value - 1, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Button key={pageNumber} type="button" variant={pageNumber === currentPage ? "default" : "outline"} size="sm" className={cn("size-8 rounded-sm p-0", pageNumber === currentPage ? "bg-black hover:bg-black/80" : "bg-transparent")} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </Button>
            ))}
            <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" disabled={currentPage === pageCount} className="border-none bg-transparent" onClick={() => setPage((value) => Math.min(value + 1, pageCount))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
