"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  LogOut,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { USER_ROLE, USER_STATUS, type UserRole } from "@/constants/enum";
import { cn } from "@/lib/utils";
import type { AccountPayload, UserRecord } from "@/lib/user-management/user-management-api";

import { AddAccountDialog } from "./add-account-dialog";
import { EditAccountDialog } from "./edit-account-dialog";

const rowsPerPage = 5;

function formatRole(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function UserStatusBadge({ status }: { status: string }) {
  const isActive = status === USER_STATUS.ACTIVE;

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 font-inter text-xs font-medium",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-yellow-200 bg-yellow-50 text-yellow-700",
      )}
    >
      {isActive ? "Active" : "Not Active"}
    </span>
  );
}

function DeleteUserAction({
  user,
  onDelete,
  isPending,
}: {
  user: UserRecord;
  onDelete: (userId: string) => Promise<unknown> | void;
  isPending?: boolean;
}) {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="icon-sm" aria-label={`Delete ${fullName}`} className="rounded-full" disabled={isPending}>
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/20 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogMedia className="mb-2 size-12 bg-destructive/10 text-destructive max-md:hidden">
            <CircleAlert className="size-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-google-sans text-xl font-semibold text-heading">
            Are you sure you want to delete this user?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-inter text-sm leading-6 text-muted-foreground">
            This will remove {fullName} from the workspace and revoke their access to Axemail.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="border border-border bg-destructive! font-google-sans text-destructive-foreground shadow-sm shadow-[#e7000b]/10 transition-all duration-200 ease-in-out hover:bg-red-400 hover:shadow-md hover:shadow-[#e7000b]/20"
            onClick={() => onDelete(user.id)}
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TerminateSessionAction({
  user,
  onTerminateSession,
  isPending,
}: {
  user: UserRecord;
  onTerminateSession: (user: UserRecord) => Promise<unknown> | void;
  isPending?: boolean;
}) {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="icon-sm" aria-label={`Terminate session for ${fullName}`} className="rounded-full bg-purple-600 text-white shadow-sm shadow-purple-600/10 hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/20" disabled={isPending}>
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/20 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogMedia className="mb-2 size-12 bg-purple-100 text-purple-700 max-md:hidden">
            <LogOut className="size-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-google-sans text-xl font-semibold text-heading">
            Are you sure you want to terminate this user session?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-inter text-sm leading-6 text-muted-foreground">
            This will immediately sign out {fullName}. The user can sign in again if their account remains active.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="border border-border bg-purple-600! font-google-sans text-white shadow-sm shadow-purple-600/10 transition-all duration-200 ease-in-out hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/20"
            onClick={() => onTerminateSession(user)}
          >
            Terminate Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EmptyRows({ message, isLoading }: { message: string; isLoading?: boolean }) {
  return (
    <tr>
      <td colSpan={4} className="px-5 py-16 text-center font-inter text-sm text-muted-foreground">
        <span className="inline-flex items-center justify-center gap-2">
          {isLoading && <LoaderCircle className="size-5 animate-spin text-primary" />}
          <span>{message}</span>
        </span>
      </td>
    </tr>
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
  const [page, setPage] = useState(1);
  const pageCount = Math.max(Math.ceil(users.length / rowsPerPage), 1);
  const activePage = Math.min(page, pageCount);
  const visibleUsers = useMemo(() => {
    const start = (activePage - 1) * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [activePage, users]);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">User Directory</h2>
            <p className="font-inter text-sm text-muted-foreground">View user roles, account status, and session controls.</p>
          </div>

          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            {canManageAccounts && <AddAccountDialog onSubmit={onCreate} isPending={isCreating} />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-215 border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <EmptyRows message="Loading users" isLoading />
              ) : visibleUsers.length === 0 ? (
                <EmptyRows message="No users found." />
              ) : (
                visibleUsers.map((user) => {
                  const fullName = `${user.firstName} ${user.lastName}`;

                  return (
                    <tr key={user.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                            <UserRound className="size-4" />
                          </span>
                          <div className="flex min-w-0 flex-col">
                            <span className="font-google-sans text-sm font-medium leading-tight text-heading">{fullName}</span>
                            <span className="mt-1 truncate font-inter text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className="text-sm font-medium">{formatRole(user.role)}</span></td>
                      <td className="px-5 py-4"><UserStatusBadge status={user.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {canManageAccounts && user.role !== USER_ROLE.ADMIN && (
                            <>
                              <EditAccountDialog user={user} onSubmit={onUpdate} isPending={isUpdating} />
                              <DeleteUserAction user={user} onDelete={onDelete} isPending={deletingUserId === user.id} />
                            </>
                          )}
                          <TerminateSessionAction user={user} onTerminateSession={onTerminateSession} isPending={terminatingUserId === user.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" disabled={activePage === 1} className="bg-transparent border-none" onClick={() => setPage((value) => Math.max(value - 1, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Button key={pageNumber} type="button" variant={pageNumber === activePage ? "default" : "outline"} size="sm" className={cn("size-8 rounded-sm p-0", pageNumber === activePage ? "bg-black hover:bg-black/80" : "bg-transparent")} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </Button>
            ))}
            <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" disabled={activePage === pageCount} className="bg-transparent border-none" onClick={() => setPage((value) => Math.min(value + 1, pageCount))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}