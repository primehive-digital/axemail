"use client";

import { useState, type ComponentType } from "react";
import {
  AtSign,
  Check,
  ChevronDown,
  IdCard,
  LockKeyhole,
  MailPlus,
  Server,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";

const smtpAccountTypes = [MAILER_TYPE.GMAIL, MAILER_TYPE.DOMAIN] satisfies MailerType[];

const smtpAccountFields = [
  {
    id: "smtp-label",
    label: "Label",
    placeholder: "Primary Gmail Sender",
    icon: IdCard,
  },
  {
    id: "smtp-email",
    label: "SMTP Email",
    placeholder: "sender@domain.com",
    type: "email",
    icon: AtSign,
  },
  {
    id: "smtp-password",
    label: "SMTP Password",
    placeholder: "Enter SMTP password",
    type: "password",
    icon: LockKeyhole,
  },
];

function formatAccountType(type: MailerType) {
  if (type === MAILER_TYPE.GMAIL) {
    return "Gmail Account";
  }

  return "Domain Mailbox";
}

function SmtpAccountInput({
  id,
  label,
  placeholder,
  icon: Icon,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  icon: ComponentType<{ className?: string }>;
  type?: string;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="font-google-sans text-sm font-semibold text-heading"
      >
        {label}
      </Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function AddSmtpMailerAccountDialog() {
  const [accountType, setAccountType] = useState<MailerType>(MAILER_TYPE.GMAIL);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
          <MailPlus className="size-4" />
          Add SMTP Mailer Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add SMTP Mailer Account</DialogTitle>
          <DialogDescription>
            Register a Gmail or domain mailbox SMTP account for sending and
            connectivity checks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="font-google-sans text-sm font-semibold text-heading">
              Account Type
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Server className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {formatAccountType(accountType)}
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width)"
              >
                {smtpAccountTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onSelect={() => setAccountType(type)}
                    className="font-inter"
                  >
                    <span className="grid w-4 place-items-center">
                      {accountType === type && <Check className="size-4" />}
                    </span>
                    {formatAccountType(type)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {smtpAccountFields.map((field) => (
            <SmtpAccountInput key={field.id} {...field} />
          ))}
        </div>

        <div className="flex justify-end">
          <Button className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20">
            Add SMTP Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
