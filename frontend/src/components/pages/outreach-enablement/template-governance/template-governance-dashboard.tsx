"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FileText, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createTemplate, deleteTemplate, listTemplates, updateTemplate, type EmailTemplate, type TemplatePayload } from "@/lib/templates/templates-api";

import { TemplateFormDialog } from "./template-form-dialog";
import { TemplatesTableCard } from "./templates-table-card";

const queryKey = ["template-governance"];

export function TemplateGovernanceDashboard() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const query = useQuery({ queryKey, queryFn: listTemplates });
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast.success("Template created successfully.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create template."),
  });
  const updateMutation = useMutation({
    mutationFn: ({ templateId, input }: { templateId: string; input: TemplatePayload }) => updateTemplate(templateId, input),
    onSuccess: () => {
      toast.success("Template updated successfully.");
      setEditingTemplate(null);
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update template."),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success("Template deleted successfully.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete template."),
  });
  const metrics = useMemo(() => {
    const templates = query.data ?? [];
    return {
      total: templates.length,
      active: templates.filter((template) => template.isActive).length,
      inactive: templates.filter((template) => !template.isActive).length,
    };
  }, [query.data]);

  return (
    <main className="flex flex-1 flex-col gap-12 bg-background p-4 sm:p-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Template Governance</h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">Create, manage, and publish reusable outreach templates with custom required fields and mailer eligibility.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void query.refetch()} className="h-10 rounded-full bg-background px-4 font-google-sans shadow-sm shadow-black/5 transition-all duration-200 hover:bg-muted hover:shadow-md">
            Refresh data
            <RefreshCw className="size-4" />
          </Button>
          <TemplateFormDialog
            mode="create"
            trigger={(
              <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
                <Plus className="size-4" />
                Add Template
              </Button>
            )}
            isPending={createMutation.isPending}
            onSubmit={(input) => createMutation.mutateAsync(input)}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Total Templates" value={metrics.total} label="Managed" />
        <MetricCard title="Active Templates" value={metrics.active} label="Available" />
        <MetricCard title="Inactive Templates" value={metrics.inactive} label="Paused" />
      </section>

      <TemplatesTableCard
        templates={query.data ?? []}
        isLoading={query.isLoading}
        onEdit={setEditingTemplate}
        onDelete={(templateId) => deleteMutation.mutate(templateId)}
        deletingTemplateId={deleteMutation.variables}
      />

      {editingTemplate && <TemplateFormDialog
        key={editingTemplate.id}
        mode="edit"
        template={editingTemplate}
        open={Boolean(editingTemplate)}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        isPending={updateMutation.isPending}
        onSubmit={(input) => updateMutation.mutateAsync({ templateId: editingTemplate.id, input })}
      />}
    </main>
  );
}

function MetricCard({ title, value, label }: { title: string; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm shadow-black/5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-inter text-sm text-muted-foreground">{title}</p>
          <p className="font-google-sans text-3xl font-semibold text-heading">{value}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-xl bg-secondary text-heading">
          <FileText className="size-5" />
        </span>
      </div>
      <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 font-google-sans text-xs font-semibold text-emerald-700">{label}</span>
    </div>
  );
}