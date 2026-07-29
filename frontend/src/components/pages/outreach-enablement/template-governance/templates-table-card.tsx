"use client";

import { Copy, FileText } from "lucide-react";
import toast from "react-hot-toast";

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
import type { EmailTemplate } from "@/lib/templates/templates-api";
import { cn } from "@/lib/utils";

export function TemplatesTableCard({
  templates,
  isLoading,
  onEdit,
  onDelete,
  deletingTemplateId,
}: {
  templates: EmailTemplate[];
  isLoading?: boolean;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (templateId: string) => void;
  deletingTemplateId?: string;
}) {
  const pagination = useTablePagination(templates);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-5">
        <h2 className="font-google-sans text-xl font-semibold text-heading">Template Directory</h2>
        <p className="font-inter text-sm text-muted-foreground">Manage reusable content, template IDs, and sender availability.</p>
      </CardHeader>
      <CardContent className="p-0">
        <ProfessionalTableViewport>
          <table className={cn(tableClassName, "min-w-260")}>
            <thead>
              <tr className={tableHeaderRowClassName}>
                {["Template", "Template ID", "Mailers", "Actions"].map((heading) => (
                  <th key={heading} className={tableHeaderCellClassName}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <ProfessionalTableEmpty colSpan={4} message="Loading templates" isLoading />
              ) : pagination.visibleRows.length === 0 ? (
                <ProfessionalTableEmpty colSpan={4} message="No templates found." />
              ) : pagination.visibleRows.map((template) => (
                <tr key={template.id} className={tableRowClassName}>
                  <td className={tableCellClassName}>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-slate-50 text-slate-600">
                        <FileText className="size-4" />
                      </span>
                      <p className="truncate font-google-sans text-sm font-semibold text-heading">{template.name}</p>
                    </div>
                  </td>
                  <td className={tableCellClassName}><TemplateIdCell id={template.id} /></td>
                  <td className={tableCellClassName}>
                    <div className="flex flex-wrap gap-2">
                      {template.supportedMailers.map((mailer) => <MailerBadge key={mailer}>{mailer}</MailerBadge>)}
                    </div>
                  </td>
                  <td className={tableCellClassName}>
                    <div className="flex flex-wrap items-center gap-2">
                      <TableActionButton action="edit" onClick={() => onEdit(template)} />
                      <ConfirmTableAction
                        action="delete"
                        title="Delete template?"
                        description={<>This permanently removes {template.name}; employees will no longer be able to send it.</>}
                        confirmLabel="Delete Template"
                        isPending={deletingTemplateId === template.id}
                        onConfirm={() => onDelete(template.id)}
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

function TemplateIdCell({ id }: { id: string }) {
  async function copyTemplateId() {
    await navigator.clipboard.writeText(id);
    toast.success("Template ID copied.");
  }

  return (
    <div className="flex max-w-64 items-center gap-2 rounded-md border border-border bg-slate-50 px-3 py-2">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-heading">{id}</code>
      <Button type="button" size="icon-sm" variant="ghost" aria-label="Copy template ID" onClick={copyTemplateId} className="size-7 shrink-0 rounded-md">
        <Copy className="size-3.5" />
      </Button>
    </div>
  );
}

function MailerBadge({ children }: { children: string }) {
  return <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-google-sans text-xs font-semibold capitalize text-slate-700">{children}</span>;
}
