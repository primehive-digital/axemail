"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import { BotDirectoryTableCard } from "@/components/pages/administration/user-management/bot-directory-table-card";
import { UserDirectoryTableCard } from "@/components/pages/administration/user-management/user-directory-table-card";
import { UserManagementMetrics } from "@/components/pages/administration/user-management/user-management-metrics";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/constants/enum";
import {
  createAutomationWorker,
  getAutomationDashboard,
  updateAutomationWorker,
  type AutomationWorker,
  type AutomationWorkerPayload,
} from "@/lib/automation/automation-api";
import {
  createAccount,
  deleteAccount,
  getUserManagementDashboard,
  terminateUserSession,
  updateAccount,
  type AccountPayload,
} from "@/lib/user-management/user-management-api";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

const userQueryKey = ["user-management-dashboard"];
const automationQueryKey = ["automation-orchestration"];

export function UserManagementDashboard() {
  const queryClient = useQueryClient();
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);
  const canManageAccounts = currentUserRole === USER_ROLE.ADMIN;
  const userQuery = useQuery({ queryKey: userQueryKey, queryFn: getUserManagementDashboard });
  const automationQuery = useQuery({ queryKey: automationQueryKey, queryFn: getAutomationDashboard });

  const invalidateUserDashboard = () => queryClient.invalidateQueries({ queryKey: userQueryKey });
  const invalidateAutomationDashboard = () => queryClient.invalidateQueries({ queryKey: automationQueryKey });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      toast.success("Account created successfully.");
      void invalidateUserDashboard();
      void invalidateAutomationDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create account."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: AccountPayload }) => updateAccount(userId, input),
    onSuccess: () => {
      toast.success("Account updated successfully.");
      void invalidateUserDashboard();
      void invalidateAutomationDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update account."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success("User deleted successfully.");
      void invalidateUserDashboard();
      void invalidateAutomationDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete user."),
  });

  const terminateMutation = useMutation({
    mutationFn: (user: import("@/lib/user-management/user-management-api").UserRecord) => terminateUserSession(user.id),
    onSuccess: (result, user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      toast.success(result.terminated ? `${fullName} session terminated successfully.` : `No active session found for ${fullName}.`);
      void invalidateUserDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to terminate user session."),
  });

  const createWorkerMutation = useMutation({
    mutationFn: createAutomationWorker,
    onSuccess: () => {
      toast.success("Worker created successfully.");
      void invalidateAutomationDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create worker."),
  });

  const updateWorkerMutation = useMutation({
    mutationFn: ({ workerId, input }: { workerId: string; input: Partial<AutomationWorkerPayload> }) => updateAutomationWorker(workerId, input),
    onSuccess: () => {
      toast.success("Worker updated successfully.");
      void invalidateAutomationDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update worker."),
  });

  const toggleWorkerMutation = useMutation({
    mutationFn: (worker: AutomationWorker) => updateAutomationWorker(worker.id, { status: worker.status === "working" ? "paused" : "working" }),
    onSuccess: (worker) => {
      toast.success(`${worker.name} ${worker.status === "working" ? "started" : "paused"} successfully.`);
      void invalidateAutomationDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to change worker status."),
  });

  const metrics = userQuery.data?.metrics ?? [];
  const users = userQuery.data?.users ?? [];
  const workers = automationQuery.data?.workers ?? [];
  const isRefreshing = (userQuery.isFetching || automationQuery.isFetching) && !(userQuery.isLoading || automationQuery.isLoading);

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-google-sans text-2xl font-semibold text-heading">User Management</h1>
            <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">Monitor users, active sessions, and role distribution across the workspace.</p>
          </div>
          <Button variant="outline" className="h-10 rounded-full px-4 font-google-sans shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-secondary hover:shadow-md hover:shadow-black/20" onClick={() => {
            void userQuery.refetch();
            void automationQuery.refetch();
          }} disabled={isRefreshing}>
            Refresh data
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        <UserManagementMetrics metrics={metrics} botCount={workers.length} />
      </section>

      <UserDirectoryTableCard
        users={users}
        canManageAccounts={canManageAccounts}
        isLoading={userQuery.isLoading}
        onCreate={(input) => createMutation.mutateAsync(input)}
        onUpdate={(userId, input) => updateMutation.mutateAsync({ userId, input })}
        onDelete={(userId) => deleteMutation.mutateAsync(userId)}
        onTerminateSession={(user) => terminateMutation.mutateAsync(user)}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        deletingUserId={deleteMutation.isPending ? deleteMutation.variables : undefined}
        terminatingUserId={terminateMutation.isPending ? terminateMutation.variables?.id : undefined}
      />

      <BotDirectoryTableCard
        workers={workers}
        currentUserRole={currentUserRole}
        isLoading={automationQuery.isLoading}
        isCreating={createWorkerMutation.isPending}
        updatingWorkerId={updateWorkerMutation.isPending ? updateWorkerMutation.variables?.workerId : undefined}
        togglingWorkerId={toggleWorkerMutation.isPending ? toggleWorkerMutation.variables?.id : undefined}
        onCreateWorker={(payload) => createWorkerMutation.mutateAsync(payload)}
        onUpdateWorker={(workerId, payload) => updateWorkerMutation.mutateAsync({ workerId, input: payload })}
        onToggleWorkerStatus={(worker) => toggleWorkerMutation.mutateAsync(worker)}
      />
    </div>
  );
}

