"use client";

import { Check, ChevronDown, FileText, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { MailerType } from "@/constants/enum";
import type { EmailTemplate } from "@/lib/templates/templates-api";

import { mailerOptions } from "./template-sender-data";

type TemplateSenderSettingsCardProps = {
  selectedMailer: MailerType;
  selectedTemplateId: string;
  templates: EmailTemplate[];
  disabled?: boolean;
  onMailerChange: (mailer: MailerType) => void;
  onTemplateChange: (templateId: string) => void;
};

export function TemplateSenderSettingsCard({ selectedMailer, selectedTemplateId, templates, disabled, onMailerChange, onTemplateChange }: TemplateSenderSettingsCardProps) {
  const selectedMailerOption = mailerOptions.find((option) => option.value === selectedMailer);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
  const SelectedMailerIcon = selectedMailerOption?.icon ?? Mail;

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0 lg:col-span-3">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">Template Sender Settings</h2>
          <p className="font-inter text-sm text-muted-foreground">Select a sender pool and an approved template before sending.</p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 lg:grid-cols-2">
        <div>
          <Label className="font-google-sans text-sm font-semibold text-heading">Mailer Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" disabled={disabled} className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal">
                <span className="flex min-w-0 items-center gap-2"><SelectedMailerIcon className="size-4 shrink-0 text-muted-foreground" /><span className="truncate">{selectedMailerOption?.label}</span></span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
              {mailerOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem key={option.value} onSelect={() => onMailerChange(option.value)} className="font-inter">
                    <span className="grid w-4 place-items-center">{selectedMailer === option.value && <Check className="size-4" />}</span>
                    <Icon className="size-4" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <Label className="font-google-sans text-sm font-semibold text-heading">Template</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" disabled={disabled || templates.length === 0} className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal">
                <span className="flex min-w-0 items-center gap-2"><FileText className="size-4 shrink-0 text-muted-foreground" /><span className="truncate">{selectedTemplate?.name ?? "No template available"}</span></span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
              {templates.map((template) => (
                <DropdownMenuItem key={template.id} onSelect={() => onTemplateChange(template.id)} className="font-inter">
                  <span className="grid w-4 place-items-center">{selectedTemplateId === template.id && <Check className="size-4" />}</span>
                  <FileText className="size-4" />
                  {template.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}