import { MailCooldownCard } from "@/components/shared/mail-cooldown-card";
import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";
import type { EmailTemplate, TemplateSenderDashboardData } from "@/lib/templates/templates-api";
import { cn } from "@/lib/utils";

import { getCapacityLogo } from "./template-sender-data";
import { TemplateSenderSettingsCard } from "./template-sender-settings-card";

export function TemplateSenderStatusSection({ selectedMailer, selectedTemplateId, data, templates, disabled, cooldownRemaining, cooldownTotalSeconds, onMailerChange, onTemplateChange }: { selectedMailer: MailerType; selectedTemplateId: string; data?: TemplateSenderDashboardData; templates: EmailTemplate[]; disabled?: boolean; cooldownRemaining: number; cooldownTotalSeconds: number; onMailerChange: (mailer: MailerType) => void; onTemplateChange: (templateId: string) => void }) {
  const isCooldownDisabled = selectedMailer === MAILER_TYPE.MASK;
  const logo = getCapacityLogo(selectedMailer);

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <TemplateSenderSettingsCard selectedMailer={selectedMailer} selectedTemplateId={selectedTemplateId} templates={templates} disabled={disabled} onMailerChange={onMailerChange} onTemplateChange={onTemplateChange} />
      <MailerCapacityCard className="lg:col-span-2" title={data?.capacity.title ?? "Mailer Capacity"} allocated={data?.capacity.allotted ?? 0} sent={data?.capacity.sent ?? 0} {...logo} />
      <div className={cn("lg:col-span-1", isCooldownDisabled && "pointer-events-none opacity-45 grayscale transition-opacity")}>
        <MailCooldownCard title="Mail Cooldown" remainingSeconds={isCooldownDisabled ? 0 : cooldownRemaining} totalSeconds={Math.max(cooldownTotalSeconds, 1)} />
      </div>
    </section>
  );
}