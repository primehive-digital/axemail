"use client";

import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Check, ChevronDown, FileCode2, FileText, Globe2, LoaderCircle, Mail, Plus, Shield, Tag, Trash2, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";
import type { EmailTemplate, TemplateField, TemplateFieldType, TemplatePayload } from "@/lib/templates/templates-api";

const fieldTypes: TemplateFieldType[] = ["text", "email", "tel", "number", "date", "datetime-local", "textarea"];
const mailerOptions = [
  { value: MAILER_TYPE.GMAIL, label: "Gmail", icon: Mail },
  { value: MAILER_TYPE.DOMAIN, label: "Domain", icon: Globe2 },
  { value: MAILER_TYPE.MASK, label: "Mask", icon: Shield },
] satisfies Array<{ value: MailerType; label: string; icon: React.ComponentType<{ className?: string }> }>;

const blankField: TemplateField = {
  key: "",
  label: "",
  placeholder: "",
  type: "text",
  required: false,
};

const initialForm: TemplatePayload = {
  name: "",
  description: "",
  subject: "",
  contentHtml: "",
  supportedMailers: [MAILER_TYPE.GMAIL, MAILER_TYPE.DOMAIN, MAILER_TYPE.MASK],
  fields: [{ ...blankField }],
  isActive: true,
};

type TemplateFormDialogProps = {
  mode: "create" | "edit";
  trigger?: ReactNode;
  template?: EmailTemplate | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isPending?: boolean;
  onSubmit: (input: TemplatePayload) => Promise<unknown> | void;
};

export function TemplateFormDialog({ mode, trigger, template, open: controlledOpen, onOpenChange, isPending, onSubmit }: TemplateFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [form, setForm] = useState<TemplatePayload>(() => template ? templateToForm(template) : initialForm);
  const open = controlledOpen ?? internalOpen;

  function setOpen(value: boolean) {
    if (value) setForm(template ? templateToForm(template) : initialForm);
    setInternalOpen(value);
    onOpenChange?.(value);
  }

  function update<Key extends keyof TemplatePayload>(key: Key, value: TemplatePayload[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateField(index: number, field: Partial<TemplateField>) {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, ...field } : item),
    }));
  }

  function addField() {
    setForm((current) => ({ ...current, fields: [...current.fields, { ...blankField }] }));
  }

  function removeField(index: number) {
    setForm((current) => ({ ...current, fields: current.fields.filter((_field, itemIndex) => itemIndex !== index) }));
  }

  function toggleMailer(mailerType: MailerType) {
    setForm((current) => {
      const exists = current.supportedMailers.includes(mailerType);
      const supportedMailers = exists
        ? current.supportedMailers.filter((value) => value !== mailerType)
        : [...current.supportedMailers, mailerType];
      return { ...current, supportedMailers };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeForm(form);

    if (!normalized.name) return toast.error("Template name is required.");
    if (!normalized.subject) return toast.error("Template subject is required.");
    if (!normalized.contentHtml) return toast.error("Template HTML content is required.");
    if (!normalized.supportedMailers.length) return toast.error("Select at least one supported mailer.");

    const duplicateField = findDuplicateField(normalized.fields);
    if (duplicateField) return toast.error(`${duplicateField} is duplicated.`);

    await onSubmit(normalized);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Template" : "Edit Template"}</DialogTitle>
          <DialogDescription>{mode === "create" ? "Build a reusable outreach template with custom fields." : "Update template fields, content, and availability."}</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <TemplateInput id="template-name" label="Template Name" placeholder="Review Notice" icon={FileText} value={form.name} required onChange={(value) => update("name", value)} />
            <TemplateInput id="template-subject" label="Subject" placeholder="Notice for {{key}}" icon={Tag} value={form.subject} required onChange={(value) => update("subject", value)} />
          </div>

          <div>
            <Label className="font-google-sans text-sm font-semibold text-heading">Description</Label>
            <Textarea value={form.description ?? ""} onChange={(event) => update("description", event.target.value)} placeholder="Short internal description for managers." className="mt-2 font-inter text-sm" />
          </div>

          <div>
            <Label className="font-google-sans text-sm font-semibold text-heading">Supported Mailers <span className="text-destructive">*</span></Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {mailerOptions.map((option) => {
                const Icon = option.icon;
                const selected = form.supportedMailers.includes(option.value);
                return (
                  <button key={option.value} type="button" onClick={() => toggleMailer(option.value)} className={`flex h-11 items-center justify-between rounded-sm border px-3 font-google-sans text-sm transition-colors ${selected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-background text-heading hover:bg-muted"}`}>
                    <span className="flex items-center gap-2"><Icon className="size-4" />{option.label}</span>
                    {selected && <Check className="size-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-google-sans text-base font-semibold text-heading">Custom Fields</h3>
                <p className="font-inter text-sm text-muted-foreground">Use field keys inside content as placeholders, for example {"{{key}}"}.</p>
              </div>
              <Button type="button" variant="outline" onClick={addField} className="h-9 rounded-full bg-background font-google-sans">
                <Plus className="size-4" />
                Field
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {form.fields.map((field, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
                  <CustomFieldInput id={`template-field-key-${index}`} label="Key" value={field.key} onChange={(value) => updateField(index, { key: value })} placeholder="key" />
                  <CustomFieldInput id={`template-field-label-${index}`} label="Label" value={field.label} onChange={(value) => updateField(index, { label: value })} placeholder="label" />
                  <CustomFieldInput id={`template-field-placeholder-${index}`} label="Placeholder" value={field.placeholder ?? ""} onChange={(value) => updateField(index, { placeholder: value })} placeholder="placeholder" />
                  <div>
                    <Label className="font-google-sans text-xs font-semibold text-muted-foreground">Type</Label>
                    <FieldTypeDropdown value={field.type} onChange={(type) => updateField(index, { type })} />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <label className="flex items-center gap-2 font-inter text-sm text-heading">
                      <Checkbox checked={field.required} onCheckedChange={(checked) => updateField(index, { required: checked === true })} />
                      Required
                    </label>
                    <Button type="button" variant="destructive" size="icon" disabled={form.fields.length === 1} onClick={() => removeField(index)} className="size-9 rounded-full bg-red-100 text-destructive hover:bg-red-200">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="font-google-sans text-sm font-semibold text-heading">HTML Content <span className="text-destructive">*</span></Label>
            <Textarea value={form.contentHtml} onChange={(event) => update("contentHtml", event.target.value)} placeholder="<p>Hello {{key}},</p>" className="mt-2 min-h-44 font-mono text-sm" />
          </div>

          <label className="flex items-center gap-2 font-inter text-sm text-heading">
            <Checkbox checked={form.isActive} onCheckedChange={(checked) => update("isActive", checked === true)} />
            Active and available in template sender
          </label>

          <div className="flex justify-end">
            <Button disabled={isPending} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <FileCode2 className="size-4" />}
              {mode === "create" ? "Create Template" : "Save Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomFieldInput({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <Label htmlFor={id} className="font-google-sans text-xs font-semibold text-muted-foreground">{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-10 rounded-sm bg-background font-inter text-sm" />
    </div>
  );
}
function TemplateInput({ id, label, placeholder, icon: Icon, value, onChange, required }: { id: string; label: string; placeholder: string; icon: React.ComponentType<{ className?: string }>; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <div>
      <Label htmlFor={id} className="font-google-sans text-sm font-semibold text-heading">{label}{required && <span className="text-destructive"> *</span>}</Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
    </div>
  );
}

function FieldTypeDropdown({ value, onChange }: { value: TemplateFieldType; onChange: (value: TemplateFieldType) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="h-10 justify-between rounded-sm bg-background font-inter font-normal">
          <span className="flex items-center gap-2"><Type className="size-4 text-muted-foreground" />{value}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        {fieldTypes.map((type) => (
          <DropdownMenuItem key={type} onSelect={() => onChange(type)} className="font-inter">
            <span className="grid w-4 place-items-center">{value === type && <Check className="size-4" />}</span>
            {type}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function templateToForm(template: EmailTemplate): TemplatePayload {
  return {
    name: template.name,
    description: template.description ?? "",
    subject: template.subject,
    contentHtml: template.contentHtml,
    supportedMailers: template.supportedMailers,
    fields: template.fields.length ? template.fields : [{ ...blankField }],
    isActive: template.isActive,
  };
}

function normalizeForm(form: TemplatePayload): TemplatePayload {
  return {
    ...form,
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    subject: form.subject.trim(),
    contentHtml: form.contentHtml.trim(),
    fields: form.fields
      .map((field) => ({
        ...field,
        key: field.key.trim(),
        label: field.label.trim(),
        placeholder: field.placeholder?.trim() || undefined,
      }))
      .filter((field) => field.key || field.label),
  };
}

function findDuplicateField(fields: TemplateField[]) {
  const seen = new Set<string>();

  for (const field of fields) {
    if (!field.key) return "Field key";
    if (!field.label) return "Field label";
    if (seen.has(field.key)) return field.key;
    seen.add(field.key);
  }

  return null;
}