"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, LoaderCircle, MailPlus, RefreshCw, Save, Upload, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";
import {
  createAutomationLeads,
  getAutomationDashboard,
  updateAutomationLead,
  type AutomationLead,
  type AutomationLeadPayload,
  type AutomationTemplate,
} from "@/lib/automation/automation-api";
import { getMailerCustomizationDashboard, type ReplyToOption } from "@/lib/mailer-customization/mailer-customization-api";
import { cn } from "@/lib/utils";

const queryKey = ["automation-orchestration"];
const customizationQueryKey = ["mailer-customization-dashboard"];

const emptyLeadForm: AutomationLeadPayload = {
  templateId: "",
  mailerType: MAILER_TYPE.GMAIL,
  fromName: "Axemail Campaign Team",
  fromEmail: "",
  replyTo: "",
  subject: "",
  previewText: "",
  recipientEmail: "",
  clientName: "",
  templateValues: {},
};

export function AutomationOrchestrationDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey, queryFn: getAutomationDashboard });
  const customizationQuery = useQuery({ queryKey: customizationQueryKey, queryFn: getMailerCustomizationDashboard });
  const templates = query.data?.templates ?? [];
  const leads = query.data?.leads ?? [];
  const summary = query.data?.summary;
  const [leadForm, setLeadForm] = useState<AutomationLeadPayload>(emptyLeadForm);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const selectedTemplate = templates.find((template) => template.id === leadForm.templateId) ?? templates[0];
  const selectedTemplateId = leadForm.templateId || selectedTemplate?.id || "";
  const selectedMailerOptions = useMemo(() => getMailerOptions(), []);
  const selectedMailerType = selectedMailerOptions.includes(leadForm.mailerType) ? leadForm.mailerType : selectedMailerOptions[0] ?? MAILER_TYPE.GMAIL;
  const currentReplyToOptions = customizationQuery.data?.mailers.find((mailer) => mailer.mailerType === selectedMailerType)?.replyToOptions ?? [];
  const selectedReplyTo = currentReplyToOptions.some((option) => option.email === leadForm.replyTo) ? leadForm.replyTo : currentReplyToOptions[0]?.email ?? "";
  const effectiveLeadForm = { ...leadForm, templateId: selectedTemplateId, mailerType: selectedMailerType, replyTo: selectedReplyTo };

  const createMutation = useMutation({
    mutationFn: (leadsInput: AutomationLeadPayload[]) => createAutomationLeads(leadsInput),
    onSuccess: (result) => {
      toast.success(`${result.created} lead${result.created === 1 ? "" : "s"} added to today's queue.`);
      setLeadForm((current) => ({ ...current, templateId: selectedTemplateId, mailerType: selectedMailerType, recipientEmail: "", clientName: "", templateValues: resetTemplateValues(selectedTemplate) }));
      setPasteValue("");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to save lead."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ leadId, input }: { leadId: string; input: AutomationLeadPayload }) => updateAutomationLead(leadId, input),
    onSuccess: () => {
      toast.success("Lead updated successfully.");
      setEditingLeadId(null);
      setLeadForm(emptyLeadForm);
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update lead."),
  });

  function handleTemplateChange(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    setLeadForm((current) => ({
      ...current,
      templateId,
      mailerType: template?.supportedMailers[0] ?? MAILER_TYPE.GMAIL,
      templateValues: resetTemplateValues(template),
    }));
  }

  function handleMailerChange(mailerType: MailerType) {
    setLeadForm((current) => ({ ...current, mailerType }));
  }

  function handleTemplateValueChange(key: string, value: string) {
    setLeadForm((current) => ({ ...current, templateValues: { ...current.templateValues, [key]: value } }));
  }

  function validateLeadForm(input: AutomationLeadPayload) {
    if (!input.templateId) return "Select a template.";
    if (!input.fromName.trim()) return "From name is required.";
    if (input.mailerType === MAILER_TYPE.MASK && !input.fromEmail?.trim()) return "From email is required for mask mailer leads.";
    if (!input.replyTo.trim()) return "Reply-to email is required.";
    if (!input.subject?.trim()) return "Subject is required.";
    if (!input.recipientEmail.trim()) return "Recipient email is required.";

    for (const field of selectedTemplate?.fields ?? []) {
      if (field.required && !input.templateValues[field.key]?.trim()) {
        return `${field.label} is required.`;
      }
    }

    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateLeadForm(effectiveLeadForm);
    if (error) {
      toast.error(error);
      return;
    }

    const payload = normalizeLeadPayload(effectiveLeadForm);
    if (editingLeadId) {
      updateMutation.mutate({ leadId: editingLeadId, input: payload });
      return;
    }

    createMutation.mutate([payload]);
  }

  function handlePasteImport() {
    if (!selectedTemplate) {
      toast.error("Select a template before importing rows.");
      return;
    }

    const rows = parsePastedLeads(pasteValue, selectedTemplate, normalizeLeadPayload(effectiveLeadForm));
    if (!rows.length) {
      toast.error("No valid lead rows were found.");
      return;
    }

    createMutation.mutate(rows);
  }

  function handleEditLead(lead: AutomationLead) {
    if (lead.status !== "pending") {
      toast.error("Only pending leads can be edited.");
      return;
    }

    setEditingLeadId(lead.id);
    setLeadForm({
      templateId: lead.templateId,
      mailerType: lead.mailerType,
      fromName: lead.fromName,
      fromEmail: lead.fromEmail ?? "",
      replyTo: lead.replyTo,
      subject: lead.subject ?? "",
      previewText: lead.previewText ?? "",
      recipientEmail: lead.recipientEmail,
      clientName: lead.clientName ?? "",
      templateValues: lead.templateValues,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="flex flex-1 flex-col gap-12 bg-background p-4 sm:p-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Automation Orchestration</h1>
          <p className="mt-1 max-w-3xl font-inter text-sm text-muted-foreground">Store today&apos;s approved leads for scheduled workers to pick up and send automatically.</p>
        </div>
        <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching} className="h-10 rounded-full bg-background px-4 font-google-sans shadow-sm shadow-black/5 transition-all duration-200 hover:bg-muted hover:shadow-md">
          <RefreshCw className={cn("size-4", query.isFetching && "animate-spin")} />
          Refresh data
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Leads" value={summary?.totalLeads ?? 0} label="Today" />
        <MetricCard title="Pending Leads" value={summary?.pendingLeads ?? 0} label="Waiting" />
        <MetricCard title="Sent Today" value={summary?.sentToday ?? 0} label="Delivered" />
        <MetricCard title="Failed Leads" value={summary?.failedToday ?? 0} label="Needs Review" />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <LeadFormCard
          form={effectiveLeadForm}
          templates={templates}
          selectedTemplate={selectedTemplate}
          selectedMailerOptions={selectedMailerOptions}
          replyToOptions={currentReplyToOptions}
          isSaving={createMutation.isPending || updateMutation.isPending}
          isEditing={Boolean(editingLeadId)}
          onTemplateChange={handleTemplateChange}
          onMailerChange={handleMailerChange}
          onFieldChange={(key, value) => setLeadForm((current) => ({ ...current, [key]: value }))}
          onTemplateValueChange={handleTemplateValueChange}
          onCancelEdit={() => {
            setEditingLeadId(null);
            setLeadForm(emptyLeadForm);
          }}
          onSubmit={handleSubmit}
        />
        <PasteImportCard
          value={pasteValue}
          template={selectedTemplate}
          isSaving={createMutation.isPending}
          onChange={setPasteValue}
          onImport={handlePasteImport}
        />
      </section>

      <LeadTableCard leads={leads} isLoading={query.isLoading} onEdit={handleEditLead} />
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
          <MailPlus className="size-5" />
        </span>
      </div>
      <span className="mt-4 inline-flex rounded-full bg-blue-50 px-3 py-1 font-google-sans text-xs font-semibold text-blue-700">{label}</span>
    </div>
  );
}

function LeadFormCard({ form, templates, selectedTemplate, selectedMailerOptions, replyToOptions, isSaving, isEditing, onTemplateChange, onMailerChange, onFieldChange, onTemplateValueChange, onCancelEdit, onSubmit }: { form: AutomationLeadPayload; templates: AutomationTemplate[]; selectedTemplate?: AutomationTemplate; selectedMailerOptions: MailerType[]; replyToOptions: ReplyToOption[]; isSaving?: boolean; isEditing: boolean; onTemplateChange: (templateId: string) => void; onMailerChange: (mailerType: MailerType) => void; onFieldChange: <Key extends keyof AutomationLeadPayload>(key: Key, value: AutomationLeadPayload[Key]) => void; onTemplateValueChange: (key: string, value: string) => void; onCancelEdit: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0 xl:col-span-3">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <h2 className="font-google-sans text-xl font-semibold text-heading">{isEditing ? "Edit Lead" : "Add Today's Lead"}</h2>
        <p className="font-inter text-sm text-muted-foreground">Choose a template, enter client details, and store the lead for today&apos;s worker queue.</p>
      </CardHeader>
      <CardContent className="p-5">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Template" value={form.templateId} onChange={onTemplateChange} options={templates.map((template) => ({ value: template.id, label: `${template.name} (${template.key})` }))} fallback="Select template" />
            <SelectField label="Mailer" value={form.mailerType} onChange={(value) => onMailerChange(value as MailerType)} options={selectedMailerOptions.map((mailer) => ({ value: mailer, label: mailerLabel(mailer) }))} fallback="Select mailer" />
            <InputField label="From Name" value={form.fromName} onChange={(value) => onFieldChange("fromName", value)} required />
            {form.mailerType === MAILER_TYPE.MASK && <InputField label="From Email" type="email" value={form.fromEmail ?? ""} onChange={(value) => onFieldChange("fromEmail", value)} required />}
            <SelectField label="Reply To" value={form.replyTo} onChange={(value) => onFieldChange("replyTo", value)} options={replyToOptions.map((option) => ({ value: option.email, label: `${option.label} - ${option.email}` }))} fallback="Select reply-to" />
            <InputField label="Subject" value={form.subject ?? ""} onChange={(value) => onFieldChange("subject", value)} required />
            <InputField label="Preview Text" value={form.previewText ?? ""} onChange={(value) => onFieldChange("previewText", value)} />
            <InputField label="Recipient Email" type="email" value={form.recipientEmail} onChange={(value) => onFieldChange("recipientEmail", value)} required />
            <InputField label="Client Name" value={form.clientName ?? ""} onChange={(value) => onFieldChange("clientName", value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(selectedTemplate?.fields ?? []).map((field) => (
              <InputField key={field.key} label={field.label} value={form.templateValues[field.key] ?? ""} placeholder={field.placeholder || field.label} required={field.required} onChange={(value) => onTemplateValueChange(field.key, value)} />
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            {isEditing && (
              <Button type="button" variant="outline" onClick={onCancelEdit} className="h-10 rounded-full bg-background px-4 font-google-sans">
                Cancel
              </Button>
            )}
            <Button disabled={isSaving} className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 hover:bg-black/80">
              {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isEditing ? "Save Lead" : "Add Lead"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasteImportCard({ value, template, isSaving, onChange, onImport }: { value: string; template?: AutomationTemplate; isSaving?: boolean; onChange: (value: string) => void; onImport: () => void }) {
  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0 xl:col-span-2">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <h2 className="font-google-sans text-xl font-semibold text-heading">Paste Rows</h2>
        <p className="font-inter text-sm text-muted-foreground">Paste copied spreadsheet rows to create multiple leads at once.</p>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div>
          <Label className="font-google-sans text-sm font-semibold text-heading">Rows</Label>
          <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={buildPastePlaceholder(template)} className="mt-2 min-h-56 w-full rounded-sm border border-input bg-background px-4 py-3 font-inter text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" />
        </div>
        <Button type="button" disabled={isSaving || !value.trim()} onClick={onImport} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans hover:bg-primary-hover">
          {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Import Rows
        </Button>
      </CardContent>
    </Card>
  );
}

function LeadTableCard({ leads, isLoading, onEdit }: { leads: AutomationLead[]; isLoading?: boolean; onEdit: (lead: AutomationLead) => void }) {
  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <h2 className="font-google-sans text-xl font-semibold text-heading">Today&apos;s Lead Queue</h2>
        <p className="font-inter text-sm text-muted-foreground">Review leads waiting for workers, sent leads, and failed deliveries.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-250 border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lead</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Template</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mailer</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Worker</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableMessage message="Loading today's leads..." /> : leads.length === 0 ? <TableMessage message="No leads stored for today." /> : leads.map((lead) => <LeadRow key={lead.id} lead={lead} onEdit={onEdit} />)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadRow({ lead, onEdit }: { lead: AutomationLead; onEdit: (lead: AutomationLead) => void }) {
  return (
    <tr className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading"><UserRound className="size-4" /></span>
          <div className="min-w-0">
            <p className="truncate font-google-sans text-sm font-semibold text-heading">{lead.clientName || lead.recipientEmail}</p>
            <p className="mt-1 truncate font-inter text-xs text-muted-foreground">{lead.recipientEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 font-inter text-sm text-heading">{lead.templateKey}</td>
      <td className="px-5 py-4 font-inter text-sm text-heading">{mailerLabel(lead.mailerType)}</td>
      <td className="px-5 py-4 font-inter text-sm text-muted-foreground">{lead.workerName ?? "Pending"}</td>
      <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
      <td className="px-5 py-4">
        <Button type="button" size="icon-sm" disabled={lead.status !== "pending"} onClick={() => onEdit(lead)} className="rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20">
          <Edit3 className="size-4" />
        </Button>
      </td>
    </tr>
  );
}

function TableMessage({ message }: { message: string }) {
  return <tr><td colSpan={6} className="h-72 px-5 py-10 text-center font-inter text-sm text-muted-foreground">{message}</td></tr>;
}

function InputField({ label, value, onChange, type = "text", placeholder, required }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <Label className="font-google-sans text-sm font-semibold text-heading">{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 rounded-sm bg-background font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
    </div>
  );
}

function SelectField({ label, value, onChange, options, fallback }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; fallback: string }) {
  return (
    <div>
      <Label className="font-google-sans text-sm font-semibold text-heading">{label}</Label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-sm border border-input bg-background px-3 font-inter text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <option value="">{fallback}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: AutomationLead["status"] }) {
  const className = status === "sent" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === "failed" ? "border-red-200 bg-red-50 text-red-700" : status === "skipped" ? "border-yellow-200 bg-yellow-50 text-yellow-700" : "border-blue-200 bg-blue-50 text-blue-700";
  return <span className={cn("inline-flex rounded-full border px-3 py-1 font-google-sans text-xs font-semibold capitalize", className)}>{status}</span>;
}

function normalizeLeadPayload(form: AutomationLeadPayload): AutomationLeadPayload {
  return {
    templateId: form.templateId,
    mailerType: form.mailerType,
    recipientEmail: form.recipientEmail.trim(),
    fromName: form.fromName.trim(),
    fromEmail: form.fromEmail?.trim() || undefined,
    replyTo: form.replyTo.trim(),
    subject: form.subject?.trim() || undefined,
    previewText: form.previewText?.trim() || undefined,
    clientName: form.clientName?.trim() || undefined,
    templateValues: Object.fromEntries(Object.entries(form.templateValues).map(([key, value]) => [key, value.trim()])),
  };
}

function resetTemplateValues(template?: AutomationTemplate) {
  return Object.fromEntries((template?.fields ?? []).map((field) => [field.key, ""]));
}

function getMailerOptions() {
  return [MAILER_TYPE.GMAIL, MAILER_TYPE.DOMAIN, MAILER_TYPE.MASK];
}

function parsePastedLeads(value: string, template: AutomationTemplate, baseLead: AutomationLeadPayload): AutomationLeadPayload[] {
  const lines = value.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];
  const firstColumns = splitRow(lines[0]).map(normalizeHeader);
  const hasHeader = firstColumns.some((column) => ["email", "to", "recipient", "recipientemail", "clientname", ...template.fields.map((field) => normalizeHeader(field.key))].includes(column));
  const headers = hasHeader ? firstColumns : ["recipientemail", "clientname", ...template.fields.map((field) => normalizeHeader(field.key))];
  const rows = hasHeader ? lines.slice(1) : lines;

  return rows.flatMap((line) => {
    const columns = splitRow(line);
    const record = Object.fromEntries(headers.map((header, headerIndex) => [header, columns[headerIndex] ?? ""]));
    const recipientEmail = record.recipientemail || record.recipient || record.email || record.to;
    if (!recipientEmail) return [];
    const templateValues = Object.fromEntries(template.fields.map((field) => [field.key, record[normalizeHeader(field.key)] || record[normalizeHeader(field.label)] || ""]));

    return [{
      ...baseLead,
      templateId: template.id,
      mailerType: baseLead.mailerType,
      recipientEmail,
      clientName: record.clientname || record.name || templateValues.clientName,
      templateValues,
    }];
  });
}

function splitRow(line: string) {
  return line.includes("\t") ? line.split("\t").map((item) => item.trim()) : line.split(",").map((item) => item.trim());
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}

function buildPastePlaceholder(template?: AutomationTemplate) {
  const fields = template?.fields.map((field) => field.key).join("\t") || "clientName\tcompanyName";
  return `recipientEmail\tclientName\t${fields}`;
}

function mailerLabel(mailerType: MailerType) {
  if (mailerType === MAILER_TYPE.GMAIL) return "Gmail";
  if (mailerType === MAILER_TYPE.DOMAIN) return "Domain";
  return "Mask";
}




