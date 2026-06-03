"use client";

import { useState, type ComponentType } from "react";
import { AtSign, Check, ChevronDown, IdCard, LoaderCircle, LockKeyhole, MailPlus, Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";
import type { SmtpMailerAccountPayload } from "@/lib/infrastructure-control/infrastructure-control-api";

const smtpAccountTypes = [MAILER_TYPE.GMAIL, MAILER_TYPE.DOMAIN] satisfies Array<Exclude<MailerType, "mask">>;

type SmtpAccountFormState = Required<SmtpMailerAccountPayload>;

const initialFormState: SmtpAccountFormState = {
  type: MAILER_TYPE.GMAIL,
  label: "",
  email: "",
  password: "",
};

function formatAccountType(type: MailerType) {
  return type === MAILER_TYPE.GMAIL ? "Gmail Account" : "Domain Mailbox";
}

function SmtpAccountInput({
  id,
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-google-sans text-sm font-semibold text-heading">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function AddSmtpMailerAccountDialog({
  onSubmit,
  isPending,
}: {
  onSubmit: (input: SmtpAccountFormState) => Promise<unknown> | void;
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SmtpAccountFormState>(initialFormState);

  function updateField<Key extends keyof SmtpAccountFormState>(key: Key, value: SmtpAccountFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialFormState);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
          <MailPlus className="size-4" />
          Add SMTP Mailer Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add SMTP Mailer Account</DialogTitle>
          <DialogDescription>Register a Gmail or domain mailbox SMTP account for sending and connectivity checks.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="font-google-sans text-sm font-semibold text-heading">Account Type</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal">
                    <span className="flex min-w-0 items-center gap-2">
                      <Server className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{formatAccountType(form.type)}</span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                  {smtpAccountTypes.map((type) => (
                    <DropdownMenuItem key={type} onSelect={() => updateField("type", type)} className="font-inter">
                      <span className="grid w-4 place-items-center">{form.type === type && <Check className="size-4" />}</span>
                      {formatAccountType(type)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <SmtpAccountInput id="smtp-label" label="Label" placeholder="Primary Gmail Sender" icon={IdCard} value={form.label} required onChange={(value) => updateField("label", value)} />
            <SmtpAccountInput id="smtp-email" label="SMTP Email" placeholder="sender@domain.com" type="email" icon={AtSign} value={form.email} required onChange={(value) => updateField("email", value)} />
            <SmtpAccountInput id="smtp-password" label="SMTP Password" placeholder="Enter SMTP password" type="password" icon={LockKeyhole} value={form.password} required onChange={(value) => updateField("password", value)} />
          </div>

          <div className="flex justify-end">
            <Button disabled={isPending} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Add SMTP Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}