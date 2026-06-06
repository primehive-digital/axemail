import { MailComposerCard } from "@/components/shared/mail-composer-card";
import type { MailerSendPayload } from "@/lib/outreach/outreach-api";

type DomainMailComposerProps = {
  onSend: (input: MailerSendPayload) => Promise<unknown>;
  isSending?: boolean;
  isCooldownActive?: boolean;
  isQuotaAvailable?: boolean;
  isLoadingCapacity?: boolean;
};

export function DomainMailComposer({ onSend, isSending, isCooldownActive, isQuotaAvailable, isLoadingCapacity }: DomainMailComposerProps) {
  return (
    <MailComposerCard
      title="Domain Mail Composer"
      description="Compose and prepare your Domain mailer message."
      onSend={onSend}
      isSending={isSending}
      isCooldownActive={isCooldownActive}
      isQuotaAvailable={isQuotaAvailable}
      isLoadingCapacity={isLoadingCapacity}
    />
  );
}