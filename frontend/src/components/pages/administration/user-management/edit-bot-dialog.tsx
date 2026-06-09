"use client";

import { useState, type ReactNode } from "react";
import { Bot, Check, ChevronDown, Clock3, LoaderCircle, Plus, Save, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AutomationWorker, AutomationWorkerPayload, AutomationWorkerStatus } from "@/lib/automation/automation-api";
import { cn } from "@/lib/utils";

const emptyWorkerForm: AutomationWorkerPayload = {
  name: "",
  pseudoName: "",
  status: "paused",
  startTime: "09:00",
};

const statusOptions: Array<{ value: AutomationWorkerStatus; label: string }> = [
  { value: "working", label: "Working" },
  { value: "paused", label: "Paused" },
];

type WorkerFormDialogProps = {
  mode: "create" | "edit";
  worker?: AutomationWorker;
  trigger: ReactNode;
  isPending?: boolean;
  onSubmit: (payload: AutomationWorkerPayload) => Promise<unknown>;
};

export function WorkerFormDialog({ mode, worker, trigger, isPending, onSubmit }: WorkerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AutomationWorkerPayload>(() => toWorkerForm(worker));

  function setField<Key extends keyof AutomationWorkerPayload>(key: Key, value: AutomationWorkerPayload[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(value: boolean) {
    if (value) setForm(toWorkerForm(worker));
    setOpen(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      name: form.name.trim(),
      pseudoName: form.pseudoName.trim(),
      status: form.status,
      startTime: form.startTime,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Worker" : "Edit Worker"}</DialogTitle>
          <DialogDescription>{mode === "create" ? "Create a worker profile and set when it should begin processing allocated leads." : "Update the worker profile and daily start time."}</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <WorkerInput id="worker-name" label="Worker Name" placeholder="Trademark Notice Worker" icon={Bot} value={form.name} required onChange={(value) => setField("name", value)} />
            <WorkerInput id="worker-pseudo" label="Pseudo Name" placeholder="Notice Runner" icon={UserRound} value={form.pseudoName} required onChange={(value) => setField("pseudoName", value)} />
            <WorkerInput id="worker-start" label="Start Time" type="time" placeholder="09:00" icon={Clock3} value={form.startTime} required onChange={(value) => setField("startTime", value)} />
            <StatusField value={form.status} onChange={(value) => setField("status", value)} />
          </div>

          <div className="rounded-xl border border-border bg-secondary/50 p-4 font-inter text-sm text-muted-foreground">
            Mailer limits, sender details, cooldown, and randomized delivery gaps are managed automatically through allocation and delivery settings.
          </div>

          <div className="flex justify-end">
            <Button disabled={isPending} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : mode === "create" ? <Plus className="size-4" /> : <Save className="size-4" />}
              {mode === "create" ? "Add Worker" : "Save Worker"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddBotDialog({ isPending, onSubmit }: { isPending?: boolean; onSubmit: (payload: AutomationWorkerPayload) => Promise<unknown> }) {
  return (
    <WorkerFormDialog
      mode="create"
      isPending={isPending}
      onSubmit={onSubmit}
      trigger={(
        <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
          <Plus className="size-4" />
          Add Worker
        </Button>
      )}
    />
  );
}

export function EditBotDialog({ worker, isPending, onSubmit }: { worker: AutomationWorker; isPending?: boolean; onSubmit: (payload: AutomationWorkerPayload) => Promise<unknown> }) {
  return (
    <WorkerFormDialog
      mode="edit"
      worker={worker}
      isPending={isPending}
      onSubmit={onSubmit}
      trigger={(
        <Button type="button" size="icon-sm" className="rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20">
          <Bot className="size-4" />
        </Button>
      )}
    />
  );
}

function StatusField({ value, onChange }: { value: AutomationWorkerStatus; onChange: (value: AutomationWorkerStatus) => void }) {
  return (
    <div>
      <Label className="font-google-sans text-sm font-semibold text-heading">Status</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal">
            {statusOptions.find((option) => option.value === value)?.label}
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {statusOptions.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => onChange(option.value)} className="font-inter">
              <span className="grid w-4 place-items-center">{value === option.value && <Check className="size-4" />}</span>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function WorkerInput({ id, label, placeholder, icon: Icon, value, onChange, type = "text", required }: { id: string; label: string; placeholder: string; icon: React.ComponentType<{ className?: string }>; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={id} className="font-google-sans text-sm font-semibold text-heading">{label}{required && <span className="text-destructive"> *</span>}</Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cn("h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring")} />
      </div>
    </div>
  );
}

function toWorkerForm(worker?: AutomationWorker): AutomationWorkerPayload {
  if (!worker) {
    return emptyWorkerForm;
  }

  return {
    name: worker.name,
    pseudoName: worker.pseudoName,
    status: worker.status,
    startTime: worker.startTime,
  };
}
