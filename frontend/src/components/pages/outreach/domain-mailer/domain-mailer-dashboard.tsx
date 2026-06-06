"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { DomainMailComposer } from "@/components/pages/outreach/domain-mailer/domain-mail-composer";
import { DomainMailerStatusSection } from "@/components/pages/outreach/domain-mailer/domain-mailer-status-section";
import { MAILER_TYPE } from "@/constants/enum";
import { getMailerStatus, sendMailerMessage, type MailerSendPayload } from "@/lib/outreach/outreach-api";

const mailerType = MAILER_TYPE.DOMAIN;
const queryKey = ["outreach-mailer-status", mailerType];

export function DomainMailerDashboard() {
  const queryClient = useQueryClient();
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const query = useQuery({ queryKey, queryFn: () => getMailerStatus(mailerType) });
  const cooldownSeconds = query.data?.cooldown.secondsRemaining ?? 0;
  const isQuotaAvailable = Boolean(query.data && query.data.capacity.allotted > 0 && query.data.capacity.remaining > 0);
  const sendMutation = useMutation({
    mutationFn: async (input: MailerSendPayload) => {
      const result = await sendMailerMessage(mailerType, input);

      if (result.status === "failed") {
        throw new Error("Domain mail failed to send.");
      }

      return result;
    },
    onSuccess: (result) => {
      if (result.status === "partial") {
        toast.success("Domain mail partially sent. Review delivery status.");
      } else {
        toast.success("Domain mail sent successfully.");
      }
      setCooldownRemaining(cooldownSeconds);
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to send domain mail."),
  });

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timeoutId = window.setTimeout(() => setCooldownRemaining((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearTimeout(timeoutId);
  }, [cooldownRemaining]);

  const displayedStatus = useMemo(() => {
    if (!query.data) return undefined;
    return {
      ...query.data,
      cooldown: {
        ...query.data.cooldown,
        secondsRemaining: cooldownRemaining,
      },
    };
  }, [cooldownRemaining, query.data]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <DomainMailerStatusSection status={displayedStatus} isLoading={query.isLoading} cooldownTotalSeconds={cooldownSeconds} />
      <DomainMailComposer
        onSend={(input) => sendMutation.mutateAsync(input)}
        isSending={sendMutation.isPending}
        isCooldownActive={cooldownRemaining > 0}
        isQuotaAvailable={isQuotaAvailable}
        isLoadingCapacity={query.isLoading}
      />
    </div>
  );
}