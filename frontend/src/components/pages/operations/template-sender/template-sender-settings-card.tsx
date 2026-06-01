"use client";

import { Check, ChevronDown, FileText, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { MailerType, TemplateKey } from "@/constants/enum";

import {
  formatTemplateKey,
  mailerOptions,
  templateOptions,
} from "./template-sender-data";

type TemplateSenderSettingsCardProps = {
  selectedMailer: MailerType;
  selectedTemplate: TemplateKey;
  onMailerChange: (mailer: MailerType) => void;
  onTemplateChange: (template: TemplateKey) => void;
};

export function TemplateSenderSettingsCard({
  selectedMailer,
  selectedTemplate,
  onMailerChange,
  onTemplateChange,
}: TemplateSenderSettingsCardProps) {
  const selectedMailerOption = mailerOptions.find(
    (option) => option.value === selectedMailer,
  );
  const SelectedMailerIcon = selectedMailerOption?.icon ?? Mail;

  return (
    <Card className="gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0 lg:col-span-3">
      <CardHeader className="border-b-2 px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">
            Template Sender Settings
          </h2>
          <p className="font-inter text-sm text-muted-foreground">
            Select a sender pool and template before starting a template-based
            campaign.
          </p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 lg:grid-cols-2">
        <div>
          <Label className="font-google-sans text-sm font-semibold text-heading">
            Mailer Type
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <SelectedMailerIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {selectedMailerOption?.label}
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              {mailerOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => onMailerChange(option.value)}
                    className="font-inter"
                  >
                    <span className="grid w-4 place-items-center">
                      {selectedMailer === option.value && (
                        <Check className="size-4" />
                      )}
                    </span>
                    <Icon className="size-4" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <Label className="font-google-sans text-sm font-semibold text-heading">
            Template
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {formatTemplateKey(selectedTemplate)}
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              {templateOptions.map((template) => (
                <DropdownMenuItem
                  key={template.value}
                  onSelect={() => onTemplateChange(template.value)}
                  className="font-inter"
                >
                  <span className="grid w-4 place-items-center">
                    {selectedTemplate === template.value && (
                      <Check className="size-4" />
                    )}
                  </span>
                  <FileText className="size-4" />
                  {template.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
