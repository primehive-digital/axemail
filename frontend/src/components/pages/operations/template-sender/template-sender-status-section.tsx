import { MailCooldownCard } from "@/components/shared/mail-cooldown-card";
import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";
import { MAILER_TYPE, type MailerType, type TemplateKey } from "@/constants/enum";
import { cn } from "@/lib/utils";

import { templateMailerData } from "./template-sender-data";
import { TemplateSenderSettingsCard } from "./template-sender-settings-card";

export function TemplateSenderStatusSection({
  selectedMailer,
  selectedTemplate,
  onMailerChange,
  onTemplateChange,
}: {
  selectedMailer: MailerType;
  selectedTemplate: TemplateKey;
  onMailerChange: (mailer: MailerType) => void;
  onTemplateChange: (template: TemplateKey) => void;
}) {
  const selectedMailerData = templateMailerData[selectedMailer];
  const isCooldownDisabled = selectedMailer === MAILER_TYPE.MASK;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <TemplateSenderSettingsCard
        selectedMailer={selectedMailer}
        selectedTemplate={selectedTemplate}
        onMailerChange={onMailerChange}
        onTemplateChange={onTemplateChange}
      />

      <MailerCapacityCard
        className="lg:col-span-2"
        {...selectedMailerData.capacity}
      />
      <div
        className={cn(
          "lg:col-span-1",
          isCooldownDisabled &&
            "pointer-events-none opacity-45 grayscale transition-opacity",
        )}
      >
        <MailCooldownCard {...selectedMailerData.cooldown} />
      </div>
    </section>
  );
}
