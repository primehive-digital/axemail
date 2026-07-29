"use client";

import { Plus } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MailerCustomization, ReplyToOption } from "@/lib/mailer-customization/mailer-customization-api";
import { cn } from "@/lib/utils";

export function ReplyToOptionsCard({
  mailer,
  deletingOptionId,
  isDeleting,
  onAdd,
  onEdit,
  onDelete,
}: {
  mailer: MailerCustomization;
  deletingOptionId?: string;
  isDeleting?: boolean;
  onAdd: () => void;
  onEdit: (option: ReplyToOption) => void;
  onDelete: (option: ReplyToOption) => void;
}) {
  const pagination = useTablePagination(mailer.replyToOptions);

  return (
    <Card className="gap-0 overflow-hidden rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Reply-To Options</h2>
            <p className="mt-1 font-inter text-sm text-muted-foreground">Approved reply-to addresses for {mailer.title.toLowerCase()}.</p>
          </div>
          <Button type="button" onClick={onAdd} className="h-10 rounded-md bg-slate-950 px-4 font-google-sans text-white hover:bg-slate-800">
            <Plus className="size-4" />
            Add Reply-To
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ProfessionalTableViewport>
          <table className={cn(tableClassName, "min-w-180")}>
            <thead>
              <tr className={tableHeaderRowClassName}>
                {["Label", "Email", "Actions"].map((heading) => (
                  <th key={heading} className={tableHeaderCellClassName}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagination.visibleRows.length === 0 ? (
                <ProfessionalTableEmpty colSpan={3} message="No reply-to options added for this mailer." />
              ) : pagination.visibleRows.map((option) => (
                <tr key={option.id} className={tableRowClassName}>
                  <td className={tableCellClassName}><span className="font-google-sans text-sm font-semibold text-heading">{option.label}</span></td>
                  <td className={tableCellClassName}><span className="font-inter text-sm text-muted-foreground">{option.email}</span></td>
                  <td className={tableCellClassName}>
                    <div className="flex flex-wrap gap-2">
                      <TableActionButton action="edit" onClick={() => onEdit(option)} />
                      <ConfirmTableAction
                        action="delete"
                        title="Delete reply-to option?"
                        description={<>This removes {option.email} from the approved reply-to list for this mailer.</>}
                        confirmLabel="Delete Reply-To"
                        isPending={Boolean(isDeleting && deletingOptionId === option.id)}
                        onConfirm={() => onDelete(option)}
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
