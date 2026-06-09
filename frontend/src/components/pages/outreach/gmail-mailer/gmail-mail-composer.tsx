import { MailComposerCard } from "@/components/shared/mail-composer-card";
import type { MailerSendPayload, ReplyToOption } from "@/lib/outreach/outreach-api";

type GmailMailComposerProps = {
  onSend: (input: MailerSendPayload) => Promise<unknown>;
  isSending?: boolean;
  isCooldownActive?: boolean;
  isQuotaAvailable?: boolean;
  isLoadingCapacity?: boolean;
  replyToOptions?: ReplyToOption[];
};

export function GmailMailComposer({ onSend, isSending, isCooldownActive, isQuotaAvailable, isLoadingCapacity, replyToOptions = [] }: GmailMailComposerProps) {
  return (
    <MailComposerCard
      title="Gmail Mail Composer"
      description="Compose and prepare your Gmail mailer message."
      onSend={onSend}
      isSending={isSending}
      isCooldownActive={isCooldownActive}
      isQuotaAvailable={isQuotaAvailable}
      isLoadingCapacity={isLoadingCapacity}
      replyToOptions={replyToOptions}
    />
  );
}

