"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FlaskConical,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddSmtpMailerAccountDialog } from "@/components/pages/administration/infrastructure-control/add-smtp-mailer-account-dialog";
import { EditSmtpMailerAccountDialog } from "@/components/pages/administration/infrastructure-control/edit-smtp-mailer-account-dialog";
import {
  MAILER_SMTP_HEALTH,
  MAILER_TYPE,
  type MailerSmtpHealth,
  type MailerType,
} from "@/constants/enum";
import { cn } from "@/lib/utils";

const smtpAccounts = [
  {
    label: "Primary Gmail Sender",
    email: "sender.one@gmail.com",
    type: MAILER_TYPE.GMAIL,
    health: MAILER_SMTP_HEALTH.ACTIVE,
  },
  {
    label: "Outbound Gmail Sender",
    email: "sender.two@gmail.com",
    type: MAILER_TYPE.GMAIL,
    health: MAILER_SMTP_HEALTH.NOT_WORKING,
  },
  {
    label: "Sales Domain Mailbox",
    email: "sales@axemail.io",
    type: MAILER_TYPE.DOMAIN,
    health: MAILER_SMTP_HEALTH.ACTIVE,
  },
  {
    label: "Operations Domain Mailbox",
    email: "ops@axemail.io",
    type: MAILER_TYPE.DOMAIN,
    health: MAILER_SMTP_HEALTH.BURNED,
  },
  {
    label: "Growth Domain Mailbox",
    email: "growth@axemail.io",
    type: MAILER_TYPE.DOMAIN,
    health: MAILER_SMTP_HEALTH.BANNED,
  },
  {
    label: "Backup Gmail Sender",
    email: "backup.sender@gmail.com",
    type: MAILER_TYPE.GMAIL,
    health: MAILER_SMTP_HEALTH.ACTIVE,
  },
];

const rowsPerPage = 5;

function formatMailerType(type: MailerType) {
  if (type === MAILER_TYPE.GMAIL) {
    return "Gmail Account";
  }

  return "Domain Mailbox";
}

function formatHealth(health: MailerSmtpHealth) {
  return health
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function HealthBadge({ health }: { health: MailerSmtpHealth }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 font-inter text-xs font-medium",
        health === MAILER_SMTP_HEALTH.ACTIVE &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        health === MAILER_SMTP_HEALTH.BURNED &&
          "border-orange-200 bg-orange-50 text-orange-700",
        health === MAILER_SMTP_HEALTH.BANNED &&
          "border-red-200 bg-red-50 text-red-700",
        health === MAILER_SMTP_HEALTH.NOT_WORKING &&
          "border-yellow-200 bg-yellow-50 text-yellow-700",
      )}
    >
      {formatHealth(health)}
    </span>
  );
}

function DeleteSmtpAccountAction({ label }: { label: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label={`Delete ${label}`}
          className="rounded-full"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/20 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogMedia className="mb-2 size-12 bg-destructive/10 text-destructive max-md:hidden">
            <CircleAlert className="size-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-google-sans text-xl font-semibold text-heading">
            Are you sure you want to delete this SMTP account?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-inter text-sm leading-6 text-muted-foreground">
            This will remove {label} from the sender pool and stop it from
            being used for SMTP sending.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="border border-border bg-destructive! font-google-sans text-destructive-foreground shadow-sm shadow-[#e7000b]/10 transition-all duration-200 ease-in-out hover:bg-red-400 hover:shadow-md hover:shadow-[#e7000b]/20"
          >
            Delete SMTP Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SmtpMailerStatusTable() {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(smtpAccounts.length / rowsPerPage);
  const visibleAccounts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return smtpAccounts.slice(start, start + rowsPerPage);
  }, [page]);

  return (
    <Card className="gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b-2 px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">
              SMTP Mailer Accounts
            </h2>
            <p className="font-inter text-sm text-muted-foreground">
              Track readiness, mailbox type, and SMTP connectivity actions.
            </p>
          </div>

          <AddSmtpMailerAccountDialog />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-200 border-collapse">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Account
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Type
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Health
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleAccounts.map((account) => (
                <tr
                  key={account.email}
                  className="border-b-2 border-border transition-colors last:border-b-0 hover:bg-secondary/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 flex-col">
                      <span className="font-google-sans text-sm font-medium leading-tight text-heading">
                        {account.label}
                      </span>
                      <span className="mt-1 truncate font-inter text-xs text-muted-foreground">
                        {account.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium">
                      {formatMailerType(account.type)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <HealthBadge health={account.health} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <EditSmtpMailerAccountDialog defaultType={account.type} />
                      <DeleteSmtpAccountAction label={account.label} />
                      <Button
                        type="button"
                        size="icon-sm"
                        aria-label={`Test ${account.label}`}
                        className="rounded-full bg-yellow-500 text-white shadow-sm shadow-yellow-500/10 transition-all duration-200 ease-in-out hover:bg-yellow-600 hover:shadow-md hover:shadow-yellow-500/20"
                      >
                        <FlaskConical className="size-4 text-black" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t-2 border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page === 1}
              className="border-none bg-transparent"
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "size-8 rounded-sm p-0",
                    pageNumber === page
                      ? "bg-black hover:bg-black/80"
                      : "bg-transparent",
                  )}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={page === pageCount}
              className="border-none bg-transparent"
              onClick={() => setPage((value) => Math.min(value + 1, pageCount))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
