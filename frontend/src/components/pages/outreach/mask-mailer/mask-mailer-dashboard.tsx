"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { MaskMailComposer } from "@/components/pages/outreach/mask-mailer/mask-mail-composer";
import { MaskMailerStatusSection } from "@/components/pages/outreach/mask-mailer/mask-mailer-status-section";
import { MAILER_TYPE } from "@/constants/enum";
import { getMailerStatus, sendMailerMessage, type MailerSendPayload } from "@/lib/outreach/outreach-api";

const mailerType = MAILER_TYPE.MASK;
const queryKey = ["outreach-mailer-status", mailerType];

export function MaskMailerDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey, queryFn: () => getMailerStatus(mailerType) });
  const isQuotaAvailable = Boolean(query.data && query.data.capacity.allotted > 0 && query.data.capacity.remaining > 0);
  const sendMutation = useMutation({
    mutationFn: async (input: MailerSendPayload) => {
      const result = await sendMailerMessage(mailerType, input);

      if (result.status === "failed") {
        throw new Error("Mask mail failed to send.");
      }

      return result;
    },
    onSuccess: (result) => {
      if (result.status === "partial") {
        toast.success("Mask mail partially sent. Review delivery status.");
      } else {
        toast.success("Mask mail sent successfully.");
      }
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to send mask mail."),
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <MaskMailerStatusSection status={query.data} isLoading={query.isLoading} />
      <MaskMailComposer
        onSend={(input) => sendMutation.mutateAsync(input)}
        isSending={sendMutation.isPending}
        isQuotaAvailable={isQuotaAvailable}
        isLoadingCapacity={query.isLoading}
      />
    </div>
  );
}