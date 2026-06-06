import { MailComposerCard } from "@/components/shared/mail-composer-card";
import type { MailerSendPayload } from "@/lib/outreach/outreach-api";

type MaskMailComposerProps = {
  onSend: (input: MailerSendPayload) => Promise<unknown>;
  isSending?: boolean;
  isQuotaAvailable?: boolean;
  isLoadingCapacity?: boolean;
};

export function MaskMailComposer({ onSend, isSending, isQuotaAvailable, isLoadingCapacity }: MaskMailComposerProps) {
  return (
    <MailComposerCard
      title="Mask Mail Composer"
      description="Compose and prepare your Mask mailer message."
      includeMaskFromEmail
      onSend={onSend}
      isSending={isSending}
      isQuotaAvailable={isQuotaAvailable}
      isLoadingCapacity={isLoadingCapacity}
    />
  );
}