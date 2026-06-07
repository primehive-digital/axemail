"use client";

import { useState, type ReactNode } from "react";
import { Bot, Check, ChevronDown, Clock3, Plus, Save, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { emptyBotRecord, type BotRecord, type BotStatus } from "./bot-directory-data";

const statusOptions: Array<{ value: BotStatus; label: string }> = [
  { value: "working", label: "Working" },
  { value: "paused", label: "Paused" },
];

type BotFormDialogProps = {
  mode: "create" | "edit";
  bot?: BotRecord;
  trigger: ReactNode;
  onSubmit: (bot: BotRecord) => void;
};

export function BotFormDialog({ mode, bot, trigger, onSubmit }: BotFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BotRecord>(bot ?? emptyBotRecord);

  function setField<Key extends keyof BotRecord>(key: Key, value: BotRecord[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(value: boolean) {
    if (value) setForm(bot ?? emptyBotRecord);
    setOpen(value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized: BotRecord = {
      ...form,
      id: form.id || `bot-${Date.now()}`,
      name: form.name.trim(),
      pseudoName: form.pseudoName.trim(),
      startTime: form.startTime.trim(),
      restWindow: form.restWindow.trim(),
    };
    onSubmit(normalized);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Bot" : "Edit Bot"}</DialogTitle>
          <DialogDescription>{mode === "create" ? "Create a frontend bot profile for future automation setup." : "Update the bot profile and its operational schedule."}</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <BotInput id="bot-name" label="Bot Name" placeholder="Trademark Notice Bot" icon={Bot} value={form.name} required onChange={(value) => setField("name", value)} />
            <BotInput id="bot-pseudo" label="Pseudo Name" placeholder="Notice Runner" icon={UserRound} value={form.pseudoName} required onChange={(value) => setField("pseudoName", value)} />
            <BotInput id="bot-start" label="Start Time" placeholder="09:30 AM" icon={Clock3} value={form.startTime} required onChange={(value) => setField("startTime", value)} />
            <BotInput id="bot-rest" label="Rest Window" placeholder="12:30 PM - 01:15 PM" icon={Clock3} value={form.restWindow} required onChange={(value) => setField("restWindow", value)} />
            <div>
              <Label className="font-google-sans text-sm font-semibold text-heading">Status</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal">
                    {statusOptions.find((option) => option.value === form.status)?.label}
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onSelect={() => setField("status", option.value)} className="font-inter">
                      <span className="grid w-4 place-items-center">{form.status === option.value && <Check className="size-4" />}</span>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20">
              {mode === "create" ? <Plus className="size-4" /> : <Save className="size-4" />}
              {mode === "create" ? "Add Bot" : "Save Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddBotDialog({ onSubmit }: { onSubmit: (bot: BotRecord) => void }) {
  return (
    <BotFormDialog
      mode="create"
      onSubmit={onSubmit}
      trigger={(
        <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
          <Plus className="size-4" />
          Add Bot
        </Button>
      )}
    />
  );
}

export function EditBotDialog({ bot, onSubmit }: { bot: BotRecord; onSubmit: (bot: BotRecord) => void }) {
  return (
    <BotFormDialog
      mode="edit"
      bot={bot}
      onSubmit={onSubmit}
      trigger={(
        <Button type="button" size="icon-sm" className="rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20">
          <Bot className="size-4" />
        </Button>
      )}
    />
  );
}

function BotInput({ id, label, placeholder, icon: Icon, value, onChange, required }: { id: string; label: string; placeholder: string; icon: React.ComponentType<{ className?: string }>; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={id} className="font-google-sans text-sm font-semibold text-heading">{label}{required && <span className="text-destructive"> *</span>}</Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} value={value} required={required} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cn("h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring")} />
      </div>
    </div>
  );
}