"use client";

import { useMemo, useState } from "react";
import { Bot, Check, ChevronDown, Globe, LoaderCircle, Mail, PencilLine, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAILER_TYPE } from "@/constants/enum";
import type { AllocationPool, AllocationRow, AllocationUser, AssignAllocationPayload } from "@/lib/allocation-management/allocation-management-api";

type AllocationFormState = {
  gmail: string;
  domain: string;
  mask: string;
};

function buildFormState(row?: AllocationRow): AllocationFormState {
  return {
    gmail: String(row?.gmail ?? 0),
    domain: String(row?.domain ?? 0),
    mask: String(row?.mask ?? 0),
  };
}

function toPayload(userId: string, form: AllocationFormState): AssignAllocationPayload {
  return {
    userId,
    gmail: Number(form.gmail || 0),
    domain: Number(form.domain || 0),
    mask: Number(form.mask || 0),
  };
}

function AllocationInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-google-sans text-sm font-semibold text-heading">
        {label}
      </Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>
    </div>
  );
}

function RemainingPoolCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-border bg-secondary p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-inter text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="size-4 text-heading" />
      </div>
      <p className="digits mt-3 text-3xl font-semibold leading-none">{value}</p>
    </div>
  );
}

export function BotAllocationLimitDialog({
  pools,
  bots,
  rows,
  onSubmit,
  isPending,
}: {
  pools: AllocationPool[];
  bots: AllocationUser[];
  rows: AllocationRow[];
  onSubmit: (input: AssignAllocationPayload) => Promise<unknown> | void;
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id ?? "");
  const selectedRow = useMemo(() => rows.find((row) => row.user.id === selectedBotId), [rows, selectedBotId]);
  const selectedBot = bots.find((bot) => bot.id === selectedBotId) ?? bots[0];
  const [form, setForm] = useState<AllocationFormState>(() => buildFormState(selectedRow));
  const poolMap = useMemo(() => new Map(pools.map((pool) => [pool.mailerType, pool])), [pools]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const firstBotId = selectedBotId || bots[0]?.id || "";
      const row = rows.find((item) => item.user.id === firstBotId);
      setSelectedBotId(firstBotId);
      setForm(buildFormState(row));
    }

    setOpen(nextOpen);
  }

  function handleSelectBot(bot: AllocationUser) {
    const row = rows.find((item) => item.user.id === bot.id);
    setSelectedBotId(bot.id);
    setForm(buildFormState(row));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBotId) {
      return;
    }

    try {
      await onSubmit(toPayload(selectedBotId, form));
      setOpen(false);
    } catch {
      return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
          <PencilLine className="size-4" />
          Assign / Edit Limits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Worker Allocation</DialogTitle>
          <DialogDescription>
            Assign or update daily mailer limits for a worker within the available pool.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-3">
            <RemainingPoolCard label="Gmail Remaining" value={poolMap.get(MAILER_TYPE.GMAIL)?.remaining ?? 0} icon={Mail} />
            <RemainingPoolCard label="Domain Remaining" value={poolMap.get(MAILER_TYPE.DOMAIN)?.remaining ?? 0} icon={Globe} />
            <RemainingPoolCard label="Mask Remaining" value={poolMap.get(MAILER_TYPE.MASK)?.remaining ?? 0} icon={Shield} />
          </div>

          <div>
            <Label className="font-google-sans text-sm font-semibold text-heading">Select Worker</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal" disabled={bots.length === 0}>
                  <span className="flex min-w-0 items-center gap-2">
                    <Bot className="size-4 text-muted-foreground" />
                    <span className="truncate">{selectedBot ? `${selectedBot.firstName} ${selectedBot.lastName}` : "No workers available"}</span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto p-1">
                {bots.map((bot) => (
                  <DropdownMenuItem key={bot.id} onSelect={() => handleSelectBot(bot)} className="font-inter">
                    <span className="grid w-4 place-items-center">{selectedBotId === bot.id && <Check className="size-4" />}</span>
                    <span className="flex min-w-0 flex-col">
                      <span>{bot.firstName} {bot.lastName}</span>
                      <span className="truncate text-xs text-muted-foreground">{bot.email}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AllocationInput id="assign-worker-gmail-limit" label="Assign Gmail Limit" icon={Mail} value={form.gmail} onChange={(value) => setForm((current) => ({ ...current, gmail: value }))} />
            <AllocationInput id="assign-worker-domain-limit" label="Assign Domain Limit" icon={Globe} value={form.domain} onChange={(value) => setForm((current) => ({ ...current, domain: value }))} />
            <AllocationInput id="assign-worker-mask-limit" label="Assign Mask Limit" icon={Shield} value={form.mask} onChange={(value) => setForm((current) => ({ ...current, mask: value }))} />
          </div>

          <div className="flex justify-end">
            <Button disabled={isPending || !selectedBotId} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending && <LoaderCircle className="size-4 animate-spin" />}
              Assign / Edit Allocation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

