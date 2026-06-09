"use client";

import { useState } from "react";
import { AtSign, IdCard, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReplyToOption, ReplyToOptionPayload } from "@/lib/mailer-customization/mailer-customization-api";

const emptyForm = { label: "", email: "" };

export function ReplyToOptionDialog({
  mode,
  open,
  option,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  mode: "add" | "edit";
  open: boolean;
  option?: ReplyToOption | null;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: Omit<ReplyToOptionPayload, "mailerType">) => void;
}) {
  const [form, setForm] = useState(option ? { label: option.label, email: option.email } : emptyForm);


  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ label: form.label.trim(), email: form.email.trim() });
    if (mode === "add") setForm(emptyForm);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Reply-To Option" : "Edit Reply-To Option"}</DialogTitle>
          <DialogDescription>{mode === "add" ? "Create an approved reply-to address for the selected mailer." : "Update this approved reply-to address."}</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="reply-to-label" className="font-google-sans text-sm font-semibold text-heading">Label <span className="text-destructive">*</span></Label>
              <div className="relative mt-2">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="reply-to-label" value={form.label} onChange={(event) => updateField("label", event.target.value)} placeholder="Support Replies" required className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
            <div>
              <Label htmlFor="reply-to-email" className="font-google-sans text-sm font-semibold text-heading">Email <span className="text-destructive">*</span></Label>
              <div className="relative mt-2">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="reply-to-email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="reply@yourdomain.com" required className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={isPending} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {mode === "add" ? "Add Reply-To" : "Save Reply-To"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


