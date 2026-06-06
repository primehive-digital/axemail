"use client";

import { useMemo, useState } from "react";
import { Edit3, FileText, LoaderCircle, Trash2 } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EmailTemplate } from "@/lib/templates/templates-api";
import { cn } from "@/lib/utils";

const pageSize = 5;

export function TemplatesTableCard({ templates, isLoading, onEdit, onDelete, deletingTemplateId }: { templates: EmailTemplate[]; isLoading?: boolean; onEdit: (template: EmailTemplate) => void; onDelete: (templateId: string) => void; deletingTemplateId?: string }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(Math.ceil(templates.length / pageSize), 1);
  const rows = useMemo(() => templates.slice((page - 1) * pageSize, page * pageSize), [page, templates]);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">Template Directory</h2>
          <p className="font-inter text-sm text-muted-foreground">Manage reusable template content, fields, and mailer availability.</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="border-b bg-secondary/60 text-left font-google-sans text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <th className="px-5 py-4">Template</th>
                <th className="px-5 py-4">Mailers</th>
                <th className="px-5 py-4">Fields</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="h-[340px] align-top">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <span className="inline-flex items-center gap-2 font-inter text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Loading templates...</span>
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((template) => (
                  <tr key={template.id} className="border-b last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading"><FileText className="size-4" /></span>
                        <div className="min-w-0">
                          <p className="truncate font-google-sans text-sm font-semibold text-heading">{template.name}</p>
                          <p className="max-w-sm truncate font-inter text-xs text-muted-foreground">{template.description || template.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {template.supportedMailers.map((mailer) => <MailerBadge key={mailer}>{mailer}</MailerBadge>)}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-inter text-sm text-heading">{template.fields.length}</td>
                    <td className="px-5 py-4"><StatusBadge active={template.isActive} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button type="button" size="icon" onClick={() => onEdit(template)} className="size-9 rounded-full border-none bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-md"><Edit3 className="size-4" /></Button>
                        <DeleteTemplateAlert template={template} onDelete={onDelete} isPending={deletingTemplateId === template.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center font-inter text-sm text-muted-foreground">No templates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="size-9 rounded-full">Prev</Button>
          <span className="grid size-9 place-items-center rounded-md bg-black font-google-sans text-sm font-semibold text-white">{page}</span>
          <Button type="button" variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(value + 1, totalPages))} className="size-9 rounded-full">Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteTemplateAlert({ template, onDelete, isPending }: { template: EmailTemplate; onDelete: (templateId: string) => void; isPending?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="icon" className="size-9 rounded-full border-none bg-red-100 text-destructive shadow-sm shadow-red-600/10 transition-all hover:bg-red-200 hover:shadow-md"><Trash2 className="size-4" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/20 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogMedia className="mb-2 size-12 bg-destructive/10 text-destructive max-md:hidden"><Trash2 className="size-5" /></AlertDialogMedia>
          <AlertDialogTitle className="font-google-sans text-xl font-semibold text-heading">Are you sure you want to delete this template?</AlertDialogTitle>
          <AlertDialogDescription className="font-inter text-sm leading-6 text-muted-foreground">This will permanently remove {template.name} from template governance and employees will no longer be able to send it.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} className="border border-border bg-destructive! font-google-sans text-destructive-foreground shadow-sm shadow-[#e7000b]/10 transition-all duration-200 ease-in-out hover:bg-red-400 hover:shadow-md hover:shadow-[#e7000b]/20" onClick={() => onDelete(template.id)}>
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : "Delete Template"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MailerBadge({ children }: { children: string }) {
  return <span className="rounded-full bg-secondary px-3 py-1 font-google-sans text-xs font-semibold capitalize text-heading">{children}</span>;
}

function StatusBadge({ active }: { active: boolean }) {
  return <span className={cn("rounded-full px-3 py-1 font-google-sans text-xs font-semibold", active ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700")}>{active ? "Active" : "Inactive"}</span>;
}