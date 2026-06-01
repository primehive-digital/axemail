import type { ComponentType } from "react";
import Image from "next/image";
import { Globe2, Mail, Save, ServerCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const sendingPolicies = [
  {
    title: "Gmail Policy",
    description: "Daily sending limit applied to each Gmail account.",
    label: "Gmail daily limit",
    placeholder: "100",
    buttonLabel: "Save Gmail Policy",
    logoSrc: "/icons/gmail-logo.png",
    logoAlt: "Gmail",
    icon: Mail,
    className: "lg:col-span-1",
  },
  {
    title: "Domain Policy",
    description: "Daily sending limit applied to each domain mailbox account.",
    label: "Domain mailbox daily limit",
    placeholder: "250",
    buttonLabel: "Save Domain Policy",
    logoSrc: "/icons/domain-logo.png",
    logoAlt: "Domain",
    icon: Globe2,
    className: "lg:col-span-1",
  },
  {
    title: "Server Policy",
    description: "Daily sending limit applied to each server.",
    label: "Server daily limit",
    placeholder: "1000",
    buttonLabel: "Save Server Policy",
    logoSrc: "/icons/server-logo.png",
    logoAlt: "Server",
    icon: ServerCog,
    className: "lg:col-span-2",
  },
];

function SendingPolicyCard({
  title,
  description,
  label,
  placeholder,
  buttonLabel,
  logoSrc,
  logoAlt,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  label: string;
  placeholder: string;
  buttonLabel: string;
  logoSrc: string;
  logoAlt: string;
  icon: ComponentType<{ className?: string }>;
  className: string;
}) {
  const inputId = title.toLowerCase().replaceAll(" ", "-");

  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0",
        className,
      )}
    >
      <CardHeader className="border-b-2 px-5 py-4 pt-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={24}
              height={24}
              className="size-6 object-contain"
            />
          </span>
          <div className="min-w-0">
            <h3 className="font-google-sans text-lg font-semibold text-heading">
              {title}
            </h3>
            <p className="mt-1 font-inter text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-5">
        <div>
          <Label
            htmlFor={inputId}
            className="font-google-sans text-sm font-semibold text-heading"
          >
            {label}
          </Label>
          <div className="relative mt-2">
            <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={inputId}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={placeholder}
              className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            className="h-10 w-fit rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20"
          >
            <Save className="size-4" />
            {buttonLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SendingPolicySection() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-google-sans text-2xl font-semibold text-heading">
          Daily Sending Policy
        </h1>
        <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
          Set the per-account or per-server daily limit for each sender pool.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sendingPolicies.map((policy) => (
          <SendingPolicyCard key={policy.title} {...policy} />
        ))}
      </div>
    </section>
  );
}
