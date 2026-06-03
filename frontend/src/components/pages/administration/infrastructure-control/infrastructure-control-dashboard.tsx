"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { MaskMailerServerCard } from "@/components/pages/administration/infrastructure-control/mask-mailer-server-card";
import { SendingPolicySection } from "@/components/pages/administration/infrastructure-control/sending-policy-section";
import { SmtpMailerStatusTable } from "@/components/pages/administration/infrastructure-control/smtp-mailer-status-table";
import type { MailerType } from "@/constants/enum";
import {
  createSmtpMailerAccount,
  deleteSmtpMailerAccount,
  getInfrastructureControlDashboard,
  testMaskServer,
  testSmtpMailerAccount,
  updateMailerPolicy,
  updateSmtpMailerAccount,
  type InfrastructureControlDashboardData,
  type SmtpMailerAccount,
  type SmtpMailerAccountPayload,
} from "@/lib/infrastructure-control/infrastructure-control-api";

const queryKey = ["infrastructure-control-dashboard"];

export function InfrastructureControlDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: getInfrastructureControlDashboard,
  });

  const invalidateDashboard = () => queryClient.invalidateQueries({ queryKey });

  const policyMutation = useMutation({
    mutationFn: ({ mailerType, dailyLimit }: { mailerType: MailerType; dailyLimit: number }) => updateMailerPolicy(mailerType, dailyLimit),
    onSuccess: (policy) => {
      const policyName = `${policy.mailerType.charAt(0).toUpperCase()}${policy.mailerType.slice(1)} policy`;
      toast.success(`${policyName} updated successfully.`);
      void invalidateDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update mailer policy."),
  });

  const createMutation = useMutation({
    mutationFn: createSmtpMailerAccount,
    onSuccess: (account) => {
      toast.success(`${account.label} added successfully.`);
      void invalidateDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to add SMTP account."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ smtpMailerAccountId, input }: { smtpMailerAccountId: string; input: SmtpMailerAccountPayload }) => updateSmtpMailerAccount(smtpMailerAccountId, input),
    onSuccess: (account) => {
      toast.success(`${account.label} updated successfully.`);
      void invalidateDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update SMTP account."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSmtpMailerAccount,
    onSuccess: () => {
      toast.success("SMTP account deleted successfully.");
      void invalidateDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete SMTP account."),
  });

  const testSmtpMutation = useMutation({
    mutationFn: (account: SmtpMailerAccount) => testSmtpMailerAccount(account),
    onSuccess: (result, testedAccount) => {
      queryClient.setQueryData(queryKey, (current: InfrastructureControlDashboardData | undefined) => current
        ? {
            ...current,
            smtpMailerAccounts: current.smtpMailerAccounts.map((item) => item.id === result.id || item.email === testedAccount.email
              ? {
                  ...item,
                  id: result.id,
                  healthStatus: result.healthStatus,
                  lastHealthCheckAt: result.lastHealthCheckAt,
                  lastHealthMessage: result.lastHealthMessage,
                }
              : item),
          }
        : current);
      toast.success("SMTP test completed successfully.");
      void invalidateDashboard();
    },
    onError: () => {
      toast.error("SMTP test request failed.");
      void invalidateDashboard();
    },
  });

  const testMaskMutation = useMutation({
    mutationFn: testMaskServer,
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, (current: InfrastructureControlDashboardData | undefined) => current ? { ...current, maskServer: result } : current);
      toast.success(result.status === "active" ? "Mask server connection verified successfully." : "Mask server test completed with a connectivity issue.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to test mask server."),
  });

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <SendingPolicySection
        policies={query.data?.policies ?? []}
        isLoading={query.isLoading}
        savingMailerType={policyMutation.isPending ? policyMutation.variables?.mailerType : undefined}
        onSavePolicy={(mailerType, dailyLimit) => policyMutation.mutate({ mailerType, dailyLimit })}
      />
      <SmtpMailerStatusTable
        accounts={query.data?.smtpMailerAccounts ?? []}
        isLoading={query.isLoading}
        onCreate={(input) => createMutation.mutateAsync(input)}
        onUpdate={(smtpMailerAccountId, input) => updateMutation.mutateAsync({ smtpMailerAccountId, input })}
        onDelete={(smtpMailerAccountId) => deleteMutation.mutate(smtpMailerAccountId)}
        onTest={(account) => testSmtpMutation.mutate(account)}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        deletingAccountId={deleteMutation.isPending ? deleteMutation.variables : undefined}
        testingAccountId={testSmtpMutation.isPending ? testSmtpMutation.variables?.id : undefined}
      />
      <MaskMailerServerCard
        server={testMaskMutation.data ?? query.data?.maskServer}
        isLoading={query.isLoading}
        isTesting={testMaskMutation.isPending}
        onTest={() => testMaskMutation.mutate()}
      />
    </div>
  );
}