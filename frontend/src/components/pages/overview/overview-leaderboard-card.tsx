"use client";

import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { behindEmployees, leaderboardModeMeta, topEmployees, type OverviewLeaderboardEmployee } from "./overview-insights-data";

type LeaderboardMode = "top" | "behind";

export function OverviewLeaderboardCard() {
  const [mode, setMode] = useState<LeaderboardMode>("top");
  const rows = useMemo(() => (mode === "top" ? topEmployees : behindEmployees), [mode]);
  const meta = leaderboardModeMeta[mode];
  const HeaderIcon = meta.icon;

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0 lg:col-span-2">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">{meta.title}</h2>
            <p className="font-inter text-sm text-muted-foreground">{meta.description}</p>
          </div>
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl border", mode === "top" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
            <HeaderIcon className="size-5" />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 rounded-full border border-border bg-secondary p-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setMode("top")} className={cn("h-9 rounded-full font-google-sans", mode === "top" && "bg-card text-heading shadow-sm shadow-black/5 hover:bg-card")}>
            Good
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMode("behind")} className={cn("h-9 rounded-full font-google-sans", mode === "behind" && "bg-card text-heading shadow-sm shadow-black/5 hover:bg-card")}>
            Shame
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {rows.map((employee, index) => (
          <EmployeeRankRow key={employee.id} employee={employee} rank={index + 1} mode={mode} />
        ))}
      </CardContent>
    </Card>
  );
}

function EmployeeRankRow({ employee, rank, mode }: { employee: OverviewLeaderboardEmployee; rank: number; mode: LeaderboardMode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary">
      <div className="flex items-center gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full font-google-sans text-sm font-semibold text-white", mode === "top" ? "bg-emerald-600" : "bg-red-500")}>
          {rank}
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-heading">
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-google-sans text-sm font-semibold text-heading">{employee.name}</p>
          <p className="mt-1 truncate font-inter text-xs text-muted-foreground">{employee.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-card">
          <span className={cn("block h-full rounded-full", mode === "top" ? "bg-emerald-500" : "bg-red-400")} style={{ width: `${employee.progress}%` }} />
        </div>
        <span className="font-inter text-xs font-semibold text-heading">{employee.completed}/{employee.target}</span>
      </div>
    </div>
  );
}