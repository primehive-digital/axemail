"use client";

import { UserRound } from "lucide-react";

import { AddAccountDialog } from "@/components/pages/administration/user-management/add-account-dialog";
import { EditAccountDialog } from "@/components/pages/administration/user-management/edit-account-dialog";
import {
  ProfessionalTableEmpty,
  ProfessionalTablePagination,
  ProfessionalTableViewport,
  tableCellClassName,
  tableClassName,
  tableHeaderCellClassName,
  tableHeaderRowClassName,
  tableRowClassName,
  useTablePagination,
} from "@/components/shared/professional-table";
import { ConfirmTableAction } from "@/components/shared/table-actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { USER_ROLE, USER_STATUS, type UserRole } from "@/constants/enum";
import type { AccountPayload, UserRecord } from "@/lib/user-management/user-management-api";
import { cn } from "@/lib/utils";

function formatRole(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function UserStatusBadge({ status }: { status: string }) {
  const isActive = status === USER_STATUS.ACTIVE;
  return (
    <span className={cn(
      "inline-flex rounded-full border px-2.5 py-1 font-inter text-xs font-medium",
      isActive
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-amber-200 bg-amber-50 text-amber-800",
    )}>
      {isActive ? "Active" : "Not Active"}
    </span>
  );
}

export function UserDirectoryTableCard({
  users,
  canManageAccounts,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  onTerminateSession,
  isCreating,
  isUpdating,
  deletingUserId,
  terminatingUserId,
}: {
  users: UserRecord[];
  canManageAccounts: boolean;
  isLoading?: boolean;
  onCreate: (input: Required<AccountPayload>) => Promise<unknown> | void;
  onUpdate: (userId: string, input: AccountPayload) => Promise<unknown> | void;
  onDelete: (userId: string) => Promise<unknown> | void;
  onTerminateSession: (user: UserRecord) => Promise<unknown> | void;
  isCreating?: boolean;
  isUpdating?: boolean;
  deletingUserId?: string;
  terminatingUserId?: string;
}) {
  const pagination = useTablePagination(users);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">User Directory</h2>
            <p className="font-inter text-sm text-muted-foreground">View user roles, account status, and session controls.</p>
          </div>
          {canManageAccounts && <AddAccountDialog onSubmit={onCreate} isPending={isCreating} />}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ProfessionalTableViewport>
          <table className={cn(tableClassName, "min-w-240")}>
            <thead>
              <tr className={tableHeaderRowClassName}>
                {["User", "Role", "Status", "Actions"].map((heading) => (
                  <th key={heading} className={tableHeaderCellClassName}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <ProfessionalTableEmpty colSpan={4} message="Loading users" isLoading />
              ) : pagination.visibleRows.length === 0 ? (
                <ProfessionalTableEmpty colSpan={4} message="No users found." />
              ) : pagination.visibleRows.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`;
                return (
                  <tr key={user.id} className={tableRowClassName}>
                    <td className={tableCellClassName}>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-slate-50 text-slate-600">
                          <UserRound className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-google-sans text-sm font-semibold text-heading">{fullName}</p>
                          <p className="mt-0.5 truncate font-inter text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={tableCellClassName}><span className="text-sm font-medium">{formatRole(user.role)}</span></td>
                    <td className={tableCellClassName}><UserStatusBadge status={user.status} /></td>
                    <td className={tableCellClassName}>
                      <div className="flex flex-wrap items-center gap-2">
                        {canManageAccounts && user.role !== USER_ROLE.ADMIN && (
                          <>
                            <EditAccountDialog user={user} onSubmit={onUpdate} isPending={isUpdating} />
                            <ConfirmTableAction
                              action="delete"
                              title="Delete user?"
                              description={<>This permanently removes {fullName} and revokes workspace access.</>}
                              confirmLabel="Delete User"
                              isPending={deletingUserId === user.id}
                              onConfirm={() => onDelete(user.id)}
                            />
                          </>
                        )}
                        <ConfirmTableAction
                          action="terminate"
                          title="Terminate active session?"
                          description={<>This immediately signs out {fullName}. They can sign in again while the account remains active.</>}
                          confirmLabel="Terminate Session"
                          isPending={terminatingUserId === user.id}
                          onConfirm={() => onTerminateSession(user)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ProfessionalTableViewport>
        <ProfessionalTablePagination
          page={pagination.activePage}
          pageCount={pagination.pageCount}
          onPageChange={pagination.setPage}
        />
      </CardContent>
    </Card>
  );
}
