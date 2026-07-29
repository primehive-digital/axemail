"use client";

import { AddSmtpMailerAccountDialog } from "@/components/pages/administration/infrastructure-control/add-smtp-mailer-account-dialog";
import { EditSmtpMailerAccountDialog } from "@/components/pages/administration/infrastructure-control/edit-smtp-mailer-account-dialog";
import {
  ProfessionalTableEmpty,
  ProfessionalTablePagination,
  ProfessionalTableViewport,
  tableCellClassName,
  tableClassName,
  tableHeaderCellClassName,
  tableHeaderRowClassName,
  tableRowClassName,
  useTablePagination,
} from "@/components/shared/professional-table";
import { ConfirmTableAction, TableActionButton } from "@/components/shared/table-actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MAILER_SMTP_HEALTH, MAILER_TYPE, type MailerSmtpHealth, type MailerType } from "@/constants/enum";
import type { SmtpMailerAccount, SmtpMailerAccountPayload } from "@/lib/infrastructure-control/infrastructure-control-api";
import { cn } from "@/lib/utils";

function formatMailerType(type: MailerType) {
  return type === MAILER_TYPE.GMAIL ? "Gmail Account" : "Domain Mailbox";
}

function formatHealth(health: MailerSmtpHealth) {
  return health.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function HealthBadge({ health }: { health: MailerSmtpHealth }) {
  return (
    <span className={cn(
      "inline-flex rounded-full border px-2.5 py-1 font-inter text-xs font-medium",
      health === MAILER_SMTP_HEALTH.ACTIVE && "border-emerald-200 bg-emerald-50 text-emerald-700",
      health === MAILER_SMTP_HEALTH.BURNED && "border-orange-200 bg-orange-50 text-orange-700",
      health === MAILER_SMTP_HEALTH.BANNED && "border-red-200 bg-red-50 text-red-700",
      health === MAILER_SMTP_HEALTH.NOT_WORKING && "border-amber-200 bg-amber-50 text-amber-800",
    )}>
      {formatHealth(health)}
    </span>
  );
}

function formatReason(message: string | null) {
  if (!message) return "-";
  const normalized = message.toLowerCase();
  if (normalized.includes("535") || normalized.includes("badcredentials") || normalized.includes("username and password not accepted") || normalized.includes("invalid login")) {
    return "Authentication failed. Check SMTP email and app password.";
  }
  return message;
}

export function SmtpMailerStatusTable({
  accounts,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  onTest,
  isCreating,
  isUpdating,
  deletingAccountId,
  testingAccountId,
}: {
  accounts: SmtpMailerAccount[];
  isLoading?: boolean;
  onCreate: (input: Required<SmtpMailerAccountPayload>) => Promise<unknown> | void;
  onUpdate: (smtpMailerAccountId: string, input: SmtpMailerAccountPayload) => Promise<unknown> | void;
  onDelete: (smtpMailerAccountId: string) => Promise<unknown> | void;
  onTest: (account: SmtpMailerAccount) => Promise<unknown> | void;
  isCreating?: boolean;
  isUpdating?: boolean;
  deletingAccountId?: string;
  testingAccountId?: string;
}) {
  const pagination = useTablePagination(accounts);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">SMTP Mailer Accounts</h2>
            <p className="font-inter text-sm text-muted-foreground">Track readiness, mailbox type, and SMTP connectivity actions.</p>
          </div>
          <AddSmtpMailerAccountDialog onSubmit={onCreate} isPending={isCreating} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ProfessionalTableViewport>
          <table className={cn(tableClassName, "min-w-280")}>
            <thead>
              <tr className={tableHeaderRowClassName}>
                {["Account", "Type", "Health", "Reason", "Actions"].map((heading) => (
                  <th key={heading} className={tableHeaderCellClassName}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <ProfessionalTableEmpty colSpan={5} message="Loading SMTP accounts" isLoading />
              ) : pagination.visibleRows.length === 0 ? (
                <ProfessionalTableEmpty colSpan={5} message="No SMTP accounts found." />
              ) : pagination.visibleRows.map((account) => (
                <tr key={account.id} className={tableRowClassName}>
                  <td className={tableCellClassName}>
                    <p className="font-google-sans text-sm font-semibold text-heading">{account.label}</p>
                    <p className="mt-0.5 truncate font-inter text-xs text-muted-foreground">{account.email}</p>
                  </td>
                  <td className={tableCellClassName}><span className="text-sm font-medium">{formatMailerType(account.type)}</span></td>
                  <td className={tableCellClassName}><HealthBadge health={account.healthStatus} /></td>
                  <td className={tableCellClassName}>
                    <p className="max-w-72 line-clamp-2 font-inter text-xs leading-5 text-muted-foreground">{formatReason(account.lastHealthMessage)}</p>
                  </td>
                  <td className={tableCellClassName}>
                    <div className="flex flex-wrap items-center gap-2">
                      <EditSmtpMailerAccountDialog account={account} onSubmit={onUpdate} isPending={isUpdating} />
                      <ConfirmTableAction
                        action="delete"
                        title="Delete SMTP account?"
                        description={<>This removes {account.label} from the sender pool and prevents future SMTP delivery through it.</>}
                        confirmLabel="Delete SMTP Account"
                        isPending={deletingAccountId === account.id}
                        onConfirm={() => onDelete(account.id)}
                      />
                      <TableActionButton
                        action="test"
                        label="Test"
                        aria-label={`Test ${account.label}`}
                        isPending={testingAccountId === account.id}
                        onClick={() => onTest(account)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ProfessionalTableViewport>
        <ProfessionalTablePagination
          page={pagination.activePage}
          pageCount={pagination.pageCount}
          onPageChange={pagination.setPage}
        />
      </CardContent>
    </Card>
  );
}
