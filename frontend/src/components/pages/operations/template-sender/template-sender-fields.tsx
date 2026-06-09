"use client";

import { useState } from "react";
import { Check, ChevronDown, Mail, Reply } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { TemplateReplyToOption } from "@/lib/templates/templates-api";

import { maskEmailExtensions, type TemplateSenderField } from "./template-sender-data";

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

export function TemplateSenderFieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: string; required?: boolean }) {
  return (
    <Label htmlFor={htmlFor} className="font-google-sans text-sm font-semibold text-heading">
      {children}
      {required && <RequiredMark />}
    </Label>
  );
}

export function TemplateSenderInput({ name, label, placeholder, icon: Icon, required, type = "text", disabled }: TemplateSenderField & { disabled?: boolean }) {
  const id = `template-${name}`;
  return (
    <div>
      <TemplateSenderFieldLabel htmlFor={id} required={required}>{label}</TemplateSenderFieldLabel>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} name={name} type={type} required={required} disabled={disabled} placeholder={placeholder} className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
    </div>
  );
}

export function TemplateVariableInput({ name, label, placeholder, required, type, disabled }: { name: string; label: string; placeholder?: string; required?: boolean; type?: string; disabled?: boolean }) {
  const inputName = `field:${name}`;
  return (
    <div>
      <TemplateSenderFieldLabel htmlFor={inputName} required={required}>{label}</TemplateSenderFieldLabel>
      {type === "textarea" ? (
        <Textarea id={inputName} name={inputName} disabled={disabled} required={required} placeholder={placeholder} className="mt-2 font-inter text-sm" />
      ) : (
        <Input id={inputName} name={inputName} type={type ?? "text"} disabled={disabled} required={required} placeholder={placeholder} className="mt-2 h-11 rounded-sm bg-background font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
      )}
    </div>
  );
}


export function TemplateReplyToField({ options, value, onChange, disabled }: { options: TemplateReplyToOption[]; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const selectedOption = options.find((option) => option.email === value);

  return (
    <div>
      <TemplateSenderFieldLabel htmlFor="template-reply-to" required>Reply-To</TemplateSenderFieldLabel>
      <input id="template-reply-to" type="hidden" name="replyTo" value={value} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" disabled={disabled || options.length === 0} className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal">
            <span className="flex min-w-0 items-center gap-2">
              <Reply className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedOption ? `${selectedOption.label} - ${selectedOption.email}` : options.length ? "Select reply-to" : "No reply-to options"}</span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {options.map((option) => (
            <DropdownMenuItem key={option.id} onSelect={() => onChange(option.email)} className="font-inter">
              <span className="grid w-4 place-items-center">{value === option.email && <Check className="size-4" />}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{option.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{option.email}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
export function MaskFromEmailField({ disabled }: { disabled?: boolean }) {
  const [extension, setExtension] = useState(maskEmailExtensions[0] ?? "gov");

  return (
    <div className="md:col-span-2">
      <TemplateSenderFieldLabel htmlFor="template-from-email-name" required>From Email</TemplateSenderFieldLabel>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="template-from-email-name" name="fromEmailName" required disabled={disabled} placeholder="sender" className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <Input value="@uspto." disabled aria-label="Static mask domain prefix" className="h-11 w-full rounded-sm bg-secondary px-4 text-center font-inter text-sm text-muted-foreground opacity-100 shadow-none sm:w-24" />
        <input type="hidden" name="fromEmailExtension" value={extension} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" disabled={disabled} className="h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal sm:w-28">
              {extension}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            {maskEmailExtensions.map((value) => (
              <DropdownMenuItem key={value} onSelect={() => setExtension(value)} className="font-inter">
                <span className="grid w-4 place-items-center">{extension === value && <Check className="size-4" />}</span>
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}




