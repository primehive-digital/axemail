"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import { Globe2, LoaderCircle, Mail, Save, ServerCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";
import type { MailerPolicy } from "@/lib/infrastructure-control/infrastructure-control-api";
import { cn } from "@/lib/utils";

const policyMeta: Record<MailerType, {
  label: string;
  placeholder: string;
  buttonLabel: string;
  logoSrc: string;
  logoAlt: string;
  icon: ComponentType<{ className?: string }>;
  className: string;
}> = {
  [MAILER_TYPE.GMAIL]: {
    label: "Gmail daily limit",
    placeholder: "150",
    buttonLabel: "Save Gmail Policy",
    logoSrc: "/icons/gmail-logo.png",
    logoAlt: "Gmail",
    icon: Mail,
    className: "lg:col-span-1",
  },
  [MAILER_TYPE.DOMAIN]: {
    label: "Domain mailbox daily limit",
    placeholder: "200",
    buttonLabel: "Save Domain Policy",
    logoSrc: "/icons/domain-logo.png",
    logoAlt: "Domain",
    icon: Globe2,
    className: "lg:col-span-1",
  },
  [MAILER_TYPE.MASK]: {
    label: "Server daily limit",
    placeholder: "2000",
    buttonLabel: "Save Server Policy",
    logoSrc: "/icons/server-logo.png",
    logoAlt: "Server",
    icon: ServerCog,
    className: "lg:col-span-2",
  },
};

const fallbackPolicies: MailerPolicy[] = [
  {
    mailerType: MAILER_TYPE.GMAIL,
    title: "Gmail Mailer Policy",
    description: "Daily sending limit applied to each Gmail account.",
    dailyLimit: 150,
  },
  {
    mailerType: MAILER_TYPE.DOMAIN,
    title: "Domain Mailer Policy",
    description: "Daily sending limit applied to each domain mailbox account.",
    dailyLimit: 200,
  },
  {
    mailerType: MAILER_TYPE.MASK,
    title: "Mask Mailer Policy",
    description: "Daily sending limit applied to each server.",
    dailyLimit: 2000,
  },
];

function SendingPolicyCard({
  policy,
  onSave,
  isPending,
}: {
  policy: MailerPolicy;
  onSave: (mailerType: MailerType, dailyLimit: number) => Promise<unknown> | void;
  isPending?: boolean;
}) {
  const meta = policyMeta[policy.mailerType];
  const [dailyLimit, setDailyLimit] = useState(String(policy.dailyLimit));
  const Icon = meta.icon;
  const inputId = `${policy.mailerType}-daily-limit`;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSave(policy.mailerType, Number(dailyLimit));
  }

  return (
    <Card className={cn("gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0", meta.className)}>
      <CardHeader className="border-b px-5 py-4 pt-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary">
            <Image src={meta.logoSrc} alt={meta.logoAlt} width={24} height={24} className="size-6 object-contain" />
          </span>
          <div className="min-w-0">
            <h3 className="font-google-sans text-lg font-semibold text-heading">{policy.title}</h3>
            <p className="mt-1 font-inter text-sm leading-5 text-muted-foreground">{policy.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor={inputId} className="font-google-sans text-sm font-semibold text-heading">
              {meta.label}
            </Label>
            <div className="relative mt-2">
              <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={inputId}
                type="number"
                min={1}
                inputMode="numeric"
                placeholder={meta.placeholder}
                value={dailyLimit}
                onChange={(event) => setDailyLimit(event.target.value)}
                className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="h-10 w-fit rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              {meta.buttonLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PolicySkeletonCard({ className }: { className: string }) {
  return (
    <Card className={cn("gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0", className)}>
      <CardHeader className="border-b px-5 py-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="size-11 rounded-full bg-secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded-sm bg-secondary" />
            <div className="h-4 w-full max-w-80 rounded-sm bg-secondary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 py-5">
        <div className="h-11 rounded-sm bg-secondary" />
        <div className="ml-auto h-10 w-44 rounded-full bg-secondary" />
      </CardContent>
    </Card>
  );
}

export function SendingPolicySection({
  policies,
  isLoading,
  savingMailerType,
  onSavePolicy,
}: {
  policies: MailerPolicy[];
  isLoading?: boolean;
  savingMailerType?: MailerType;
  onSavePolicy: (mailerType: MailerType, dailyLimit: number) => Promise<unknown> | void;
}) {
  const visiblePolicies = policies.length > 0 ? policies : fallbackPolicies;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-google-sans text-2xl font-semibold text-heading">Daily Sending Policy</h1>
        <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
          Set the per-account or per-server daily limit for each sender pool.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading
          ? fallbackPolicies.map((policy) => <PolicySkeletonCard key={policy.mailerType} className={policyMeta[policy.mailerType].className} />)
          : visiblePolicies.map((policy) => (
              <SendingPolicyCard
                key={`${policy.mailerType}-${policy.dailyLimit}`}
                policy={policy}
                onSave={onSavePolicy}
                isPending={savingMailerType === policy.mailerType}
              />
            ))}
      </div>
    </section>
  );
}