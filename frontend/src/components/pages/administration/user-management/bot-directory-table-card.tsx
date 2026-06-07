"use client";

import { useMemo, useState } from "react";
import { Bot, ChevronLeft, ChevronRight, Clock3, LoaderCircle, Pause, Play } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { USER_ROLE, type UserRole } from "@/constants/enum";
import { cn } from "@/lib/utils";

import type { BotRecord, BotStatus } from "./bot-directory-data";
import { AddBotDialog, EditBotDialog } from "./edit-bot-dialog";

const rowsPerPage = 5;

const statusStyles: Record<BotStatus, string> = {
  working: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paused: "border-yellow-200 bg-yellow-50 text-yellow-700",
};

function BotStatusBadge({ status }: { status: BotStatus }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 font-inter text-xs font-medium capitalize", statusStyles[status])}>{status === "working" ? "Working" : "Paused"}</span>;
}

function EmptyRows({ message, isLoading }: { message: string; isLoading?: boolean }) {
  return (
    <tr>
      <td colSpan={4} className="px-5 py-16 text-center font-inter text-sm text-muted-foreground">
        <span className="inline-flex items-center justify-center gap-2">
          {isLoading && <LoaderCircle className="size-5 animate-spin text-primary" />}
          <span>{message}</span>
        </span>
      </td>
    </tr>
  );
}
function BotStatusAction({ bot, onToggleBotStatus }: { bot: BotRecord; onToggleBotStatus: (bot: BotRecord) => void }) {
  const isWorking = bot.status === "working";
  const actionLabel = isWorking ? "Pause Bot" : "Start Bot";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="icon-sm" aria-label={isWorking ? `Pause ${bot.name}` : `Start ${bot.name}`} className={cn("rounded-full text-white shadow-sm transition-all hover:shadow-md", isWorking ? "bg-yellow-500 shadow-yellow-500/10 hover:bg-yellow-600 hover:shadow-yellow-500/20" : "bg-blue-500 shadow-blue-500/10 hover:bg-blue-600 hover:shadow-blue-500/20")}>
          {isWorking ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/20 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogMedia className={cn("mb-2 size-12 max-md:hidden", isWorking ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700")}>
            {isWorking ? <Pause className="size-6" /> : <Play className="size-6" />}
          </AlertDialogMedia>
          <AlertDialogTitle className="font-google-sans text-xl font-semibold text-heading">
            Are you sure you want to {isWorking ? "pause" : "start"} this bot?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-inter text-sm leading-6 text-muted-foreground">
            {isWorking ? `This will pause ${bot.name} and stop its scheduled automation until it is started again.` : `This will start ${bot.name} and allow it to resume scheduled automation.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className={cn("border border-border font-google-sans text-white shadow-sm transition-all duration-200 ease-in-out hover:shadow-md", isWorking ? "bg-yellow-500! shadow-yellow-500/10 hover:bg-yellow-600" : "bg-blue-500! shadow-blue-500/10 hover:bg-blue-600")} onClick={() => onToggleBotStatus(bot)}>
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BotDirectoryTableCard({ bots, currentUserRole, onCreateBot, onUpdateBot, onToggleBotStatus }: { bots: BotRecord[]; currentUserRole?: UserRole; onCreateBot: (bot: BotRecord) => void; onUpdateBot: (bot: BotRecord) => void; onToggleBotStatus: (bot: BotRecord) => void }) {
  const [page, setPage] = useState(1);
  const canManageBots = currentUserRole === USER_ROLE.ADMIN;
  const pageCount = Math.max(Math.ceil(bots.length / rowsPerPage), 1);
  const activePage = Math.min(page, pageCount);
  const visibleBots = useMemo(() => {
    const start = (activePage - 1) * rowsPerPage;
    return bots.slice(start, start + rowsPerPage);
  }, [activePage, bots]);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Bot Directory</h2>
            <p className="font-inter text-sm text-muted-foreground">View automation bot profiles and daily run schedules.</p>
          </div>
          {canManageBots && <AddBotDialog onSubmit={onCreateBot} />}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bot</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBots.length === 0 ? (
                <EmptyRows message="No bots found." />
              ) : (
                visibleBots.map((bot) => (
                  <tr key={bot.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                          <Bot className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm font-medium leading-tight text-heading">{bot.name}</span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">{bot.pseudoName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><BotStatusBadge status={bot.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-start gap-2">
                        <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-inter text-sm text-heading">Starts {bot.startTime}</span>
                          <span className="mt-1 font-inter text-xs text-muted-foreground">Rest {bot.restWindow}</span>
                          <span className="mt-1 font-inter text-xs text-muted-foreground">Last run: {bot.lastRun}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {canManageBots ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <EditBotDialog bot={bot} onSubmit={onUpdateBot} />
                          <BotStatusAction bot={bot} onToggleBotStatus={onToggleBotStatus} />
                        </div>
                      ) : (
                        <span className="font-inter text-xs text-muted-foreground">View only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon-sm" aria-label="Previous bot page" disabled={activePage === 1} className="border-none bg-transparent" onClick={() => setPage((value) => Math.max(value - 1, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Button key={pageNumber} type="button" variant={pageNumber === activePage ? "default" : "outline"} size="sm" className={cn("size-8 rounded-sm p-0", pageNumber === activePage ? "bg-black hover:bg-black/80" : "bg-transparent")} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </Button>
            ))}
            <Button type="button" variant="outline" size="icon-sm" aria-label="Next bot page" disabled={activePage === pageCount} className="border-none bg-transparent" onClick={() => setPage((value) => Math.min(value + 1, pageCount))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}