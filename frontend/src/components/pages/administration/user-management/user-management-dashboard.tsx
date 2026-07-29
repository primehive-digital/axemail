"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import { UserDirectoryTableCard } from "@/components/pages/administration/user-management/user-directory-table-card";
import { UserManagementMetrics } from "@/components/pages/administration/user-management/user-management-metrics";
import { Button } from "@/components/ui/button";
import { USER_ROLE } from "@/constants/enum";
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

const queryKey = ["user-management-dashboard"];

export function UserManagementDashboard() {
  const queryClient = useQueryClient();
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);
  const canManageAccounts = currentUserRole === USER_ROLE.ADMIN;
  const query = useQuery({ queryKey, queryFn: getUserManagementDashboard });
  const invalidateDashboard = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => { toast.success("Account created successfully."); void invalidateDashboard(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create account."),
  });
  const updateMutation = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: AccountPayload }) => updateAccount(userId, input),
    onSuccess: () => { toast.success("Account updated successfully."); void invalidateDashboard(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update account."),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => { toast.success("User deleted successfully."); void invalidateDashboard(); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete user."),
  });
  const terminateMutation = useMutation({
    mutationFn: (user: import("@/lib/user-management/user-management-api").UserRecord) => terminateUserSession(user.id),
    onSuccess: (result, user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      toast.success(result.terminated ? `${fullName} session terminated successfully.` : `No active session found for ${fullName}.`);
      void invalidateDashboard();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to terminate user session."),
  });

  const isRefreshing = query.isFetching && !query.isLoading;

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-google-sans text-2xl font-semibold text-heading">User Management</h1>
            <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">Manage sender accounts, roles, and active sessions.</p>
          </div>
          <Button variant="outline" className="h-10 rounded-full px-4" onClick={() => void query.refetch()} disabled={isRefreshing}>
            Refresh data
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        <UserManagementMetrics metrics={query.data?.metrics ?? []} />
      </section>

      <UserDirectoryTableCard
        users={query.data?.users ?? []}
        canManageAccounts={canManageAccounts}
        isLoading={query.isLoading}
        onCreate={(input) => createMutation.mutateAsync(input)}
        onUpdate={(userId, input) => updateMutation.mutateAsync({ userId, input })}
        onDelete={(userId) => deleteMutation.mutateAsync(userId)}
        onTerminateSession={(user) => terminateMutation.mutateAsync(user)}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        deletingUserId={deleteMutation.isPending ? deleteMutation.variables : undefined}
        terminatingUserId={terminateMutation.isPending ? terminateMutation.variables?.id : undefined}
      />
    </div>
  );
}
