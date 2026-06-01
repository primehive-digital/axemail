"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LogOut,
  RefreshCw,
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

import { AddAccountDialog } from "./add-account-dialog";
import { EditAccountDialog } from "./edit-account-dialog";

const users = [
  {
    firstName: "Hassan",
    lastName: "Raza",
    email: "hassan.raza@axemail.com",
    role: USER_ROLE.MANAGER,
    status: USER_STATUS.ACTIVE,
  },
  {
    firstName: "Mariam",
    lastName: "Siddiqui",
    email: "mariam.siddiqui@axemail.com",
    role: USER_ROLE.EMPLOYEE,
    status: USER_STATUS.ACTIVE,
  },
  {
    firstName: "Usman",
    lastName: "Ali",
    email: "usman.ali@axemail.com",
    role: USER_ROLE.EMPLOYEE,
    status: USER_STATUS.NOT_ACTIVE,
  },
  {
    firstName: "Sana",
    lastName: "Ahmed",
    email: "sana.ahmed@axemail.com",
    role: USER_ROLE.MANAGER,
    status: USER_STATUS.ACTIVE,
  },
  {
    firstName: "Bilal",
    lastName: "Sheikh",
    email: "bilal.sheikh@axemail.com",
    role: USER_ROLE.EMPLOYEE,
    status: USER_STATUS.NOT_ACTIVE,
  },
  {
    firstName: "Zara",
    lastName: "Malik",
    email: "zara.malik@axemail.com",
    role: USER_ROLE.EMPLOYEE,
    status: USER_STATUS.ACTIVE,
  },
  {
    firstName: "Ayesha",
    lastName: "Khan",
    email: "ayesha.khan@axemail.com",
    role: USER_ROLE.MANAGER,
    status: USER_STATUS.ACTIVE,
  },
  {
    firstName: "Danish",
    lastName: "Farooq",
    email: "danish.farooq@axemail.com",
    role: USER_ROLE.EMPLOYEE,
    status: USER_STATUS.NOT_ACTIVE,
  },
  {
    firstName: "Nida",
    lastName: "Qureshi",
    email: "nida.qureshi@axemail.com",
    role: USER_ROLE.EMPLOYEE,
    status: USER_STATUS.ACTIVE,
  },
  {
    firstName: "Omar",
    lastName: "Hussain",
    email: "omar.hussain@axemail.com",
    role: USER_ROLE.MANAGER,
    status: USER_STATUS.ACTIVE,
  },
  {
    firstName: "Rabia",
    lastName: "Javed",
    email: "rabia.javed@axemail.com",
    role: USER_ROLE.EMPLOYEE,
    status: USER_STATUS.NOT_ACTIVE,
  },
];

const rowsPerPage = 5;

function formatRole(role: UserRole) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function DeleteUserAction({ fullName }: { fullName: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label={`Delete ${fullName}`}
          className="rounded-full"
        >
          <Trash2 className="size-4" />
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
            This will remove {fullName} from the workspace and revoke their
            access to Axemail.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="border border-border bg-destructive! font-google-sans text-destructive-foreground shadow-sm shadow-[#e7000b]/10 transition-all duration-200 ease-in-out hover:bg-red-400 hover:shadow-md hover:shadow-[#e7000b]/20"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TerminateSessionAction({ fullName }: { fullName: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          aria-label={`Terminate session for ${fullName}`}
          className="rounded-full bg-purple-600 text-white shadow-sm shadow-purple-600/10 hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/20"
        >
          <LogOut className="size-4" />
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
            This will immediately sign out {fullName}. The user can sign in
            again if their account remains active.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className="border border-border bg-purple-600! font-google-sans text-white shadow-sm shadow-purple-600/10 transition-all duration-200 ease-in-out hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/20">
            Terminate Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UserDirectoryTableCard() {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(users.length / rowsPerPage);
  const visibleUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return users.slice(start, start + rowsPerPage);
  }, [page]);

  return (
    <Card className="gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b-2 px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">
              User Directory
            </h2>
            <p className="font-inter text-sm text-muted-foreground">
              View user roles, account status, and session controls.
            </p>
          </div>

          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="h-10 rounded-full px-4 font-google-sans shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-secondary hover:shadow-md hover:shadow-black/20"
            >
              Refresh data
              <RefreshCw className="size-4" />
            </Button>
            <AddAccountDialog />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-215 border-collapse">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  User
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`;

                return (
                  <tr
                    key={user.email}
                    className="border-b-2 border-border transition-colors last:border-b-0 hover:bg-secondary/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                          <UserRound className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm font-medium leading-tight text-heading">
                            {fullName}
                          </span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium">
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <EditAccountDialog defaultRole={user.role} />
                        <DeleteUserAction fullName={fullName} />
                        <TerminateSessionAction fullName={fullName} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t-2 border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page === 1}
              className="bg-transparent border-none"
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "size-8 rounded-sm p-0",
                    pageNumber === page
                      ? "bg-black hover:bg-black/80"
                      : "bg-transparent",
                  )}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={page === pageCount}
              className="bg-transparent border-none"
              onClick={() => setPage((value) => Math.min(value + 1, pageCount))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
