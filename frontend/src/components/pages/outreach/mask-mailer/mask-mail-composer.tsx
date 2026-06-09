import { MailComposerCard } from "@/components/shared/mail-composer-card";
import type { MailerSendPayload, ReplyToOption } from "@/lib/outreach/outreach-api";

type MaskMailComposerProps = {
  onSend: (input: MailerSendPayload) => Promise<unknown>;
  isSending?: boolean;
  isQuotaAvailable?: boolean;
  isLoadingCapacity?: boolean;
  replyToOptions?: ReplyToOption[];
};

export function MaskMailComposer({ onSend, isSending, isQuotaAvailable, isLoadingCapacity, replyToOptions = [] }: MaskMailComposerProps) {
  return (
    <MailComposerCard
      title="Mask Mail Composer"
      description="Compose and prepare your Mask mailer message."
      includeMaskFromEmail
      onSend={onSend}
      isSending={isSending}
      isQuotaAvailable={isQuotaAvailable}
      isLoadingCapacity={isLoadingCapacity}
      replyToOptions={replyToOptions}
    />
  );
}

