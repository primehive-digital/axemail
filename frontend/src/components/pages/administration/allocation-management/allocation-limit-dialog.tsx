"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Globe, LoaderCircle, Mail, Shield, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableActionButton } from "@/components/shared/table-actions";
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

export function AllocationLimitDialog({
  pools,
  users,
  rows,
  onSubmit,
  isPending,
}: {
  pools: AllocationPool[];
  users: AllocationUser[];
  rows: AllocationRow[];
  onSubmit: (input: AssignAllocationPayload) => Promise<unknown> | void;
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const selectedRow = useMemo(() => rows.find((row) => row.user.id === selectedUserId), [rows, selectedUserId]);
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const [form, setForm] = useState<AllocationFormState>(() => buildFormState(selectedRow));
  const poolMap = useMemo(() => new Map(pools.map((pool) => [pool.mailerType, pool])), [pools]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const firstUserId = selectedUserId || users[0]?.id || "";
      const row = rows.find((item) => item.user.id === firstUserId);
      setSelectedUserId(firstUserId);
      setForm(buildFormState(row));
    }

    setOpen(nextOpen);
  }

  function handleSelectUser(user: AllocationUser) {
    const row = rows.find((item) => item.user.id === user.id);
    setSelectedUserId(user.id);
    setForm(buildFormState(row));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUserId) {
      return;
    }

    try {
      await onSubmit(toPayload(selectedUserId, form));
      setOpen(false);
    } catch {
      return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <TableActionButton action="edit" label="Assign / Edit Limits" className="h-10 px-4 text-sm" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Mailer Allocation</DialogTitle>
          <DialogDescription>
            Assign or update daily mailer limits for an employee within the available pool.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-3">
            <RemainingPoolCard label="Gmail Remaining" value={poolMap.get(MAILER_TYPE.GMAIL)?.remaining ?? 0} icon={Mail} />
            <RemainingPoolCard label="Domain Remaining" value={poolMap.get(MAILER_TYPE.DOMAIN)?.remaining ?? 0} icon={Globe} />
            <RemainingPoolCard label="Mask Remaining" value={poolMap.get(MAILER_TYPE.MASK)?.remaining ?? 0} icon={Shield} />
          </div>

          <div>
            <Label className="font-google-sans text-sm font-semibold text-heading">Select User</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal" disabled={users.length === 0}>
                  <span className="flex min-w-0 items-center gap-2">
                    <UserRound className="size-4 text-muted-foreground" />
                    <span className="truncate">{selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "No employees available"}</span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto p-1">
                {users.map((user) => (
                  <DropdownMenuItem key={user.id} onSelect={() => handleSelectUser(user)} className="font-inter">
                    <span className="grid w-4 place-items-center">{selectedUserId === user.id && <Check className="size-4" />}</span>
                    <span className="flex min-w-0 flex-col">
                      <span>{user.firstName} {user.lastName}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AllocationInput id="assign-gmail-limit" label="Assign Gmail Limit" icon={Mail} value={form.gmail} onChange={(value) => setForm((current) => ({ ...current, gmail: value }))} />
            <AllocationInput id="assign-domain-limit" label="Assign Domain Limit" icon={Globe} value={form.domain} onChange={(value) => setForm((current) => ({ ...current, domain: value }))} />
            <AllocationInput id="assign-mask-limit" label="Assign Mask Limit" icon={Shield} value={form.mask} onChange={(value) => setForm((current) => ({ ...current, mask: value }))} />
          </div>

          <div className="flex justify-end">
            <Button disabled={isPending || !selectedUserId} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending && <LoaderCircle className="size-4 animate-spin" />}
              Assign / Edit Allocation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
