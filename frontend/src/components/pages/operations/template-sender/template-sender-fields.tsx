"use client";

import { useState } from "react";
import { Check, ChevronDown, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  maskEmailExtensions,
  type TemplateSenderField,
} from "./template-sender-data";

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

export function TemplateSenderFieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: string;
  required?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="font-google-sans text-sm font-semibold text-heading"
    >
      {children}
      {required && <RequiredMark />}
    </Label>
  );
}

export function TemplateSenderInput({
  id,
  label,
  placeholder,
  icon: Icon,
  required,
  type = "text",
}: TemplateSenderField) {
  return (
    <div className={cn(id === "template-subject" && "md:col-span-2")}>
      <TemplateSenderFieldLabel htmlFor={id} required={required}>
        {label}
      </TemplateSenderFieldLabel>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          required={required}
          placeholder={placeholder}
          className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function MaskFromEmailField() {
  const [extension, setExtension] = useState(maskEmailExtensions[0] ?? "gov");

  return (
    <div className="md:col-span-2">
      <TemplateSenderFieldLabel htmlFor="template-from-email-name" required>
        From Email
      </TemplateSenderFieldLabel>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="template-from-email-name"
            required
            placeholder="sender"
            className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Input
          value="@uspto."
          disabled
          aria-label="Static mask domain prefix"
          className="h-11 w-full rounded-sm bg-secondary px-4 text-center font-inter text-sm text-muted-foreground opacity-100 shadow-none sm:w-24"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal sm:w-28"
            >
              {extension}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            {maskEmailExtensions.map((value) => (
              <DropdownMenuItem
                key={value}
                onSelect={() => setExtension(value)}
                className="font-inter"
              >
                <span className="grid w-4 place-items-center">
                  {extension === value && <Check className="size-4" />}
                </span>
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
