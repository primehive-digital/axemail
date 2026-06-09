import { MailComposerCard } from "@/components/shared/mail-composer-card";
import type { MailerSendPayload, ReplyToOption } from "@/lib/outreach/outreach-api";

type DomainMailComposerProps = {
  onSend: (input: MailerSendPayload) => Promise<unknown>;
  isSending?: boolean;
  isCooldownActive?: boolean;
  isQuotaAvailable?: boolean;
  isLoadingCapacity?: boolean;
  replyToOptions?: ReplyToOption[];
};

export function DomainMailComposer({ onSend, isSending, isCooldownActive, isQuotaAvailable, isLoadingCapacity, replyToOptions = [] }: DomainMailComposerProps) {
  return (
    <MailComposerCard
      title="Domain Mail Composer"
      description="Compose and prepare your Domain mailer message."
      onSend={onSend}
      isSending={isSending}
      isCooldownActive={isCooldownActive}
      isQuotaAvailable={isQuotaAvailable}
      isLoadingCapacity={isLoadingCapacity}
      replyToOptions={replyToOptions}
    />
  );
}

