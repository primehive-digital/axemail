"use client";

import { useState } from "react";
import {
  AtSign,
  Check,
  ChevronDown,
  IdCard,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  User,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USER_ROLE, type UserRole } from "@/constants/enum";
import type {
  AccountPayload,
  UserRecord,
} from "@/lib/user-management/user-management-api";

const accountRoles = [USER_ROLE.MANAGER, USER_ROLE.EMPLOYEE] satisfies Array<
  Exclude<UserRole, "admin">
>;

type EditFormState = Required<Omit<AccountPayload, "password">> & {
  password: string;
};

function buildInitialForm(user: UserRecord): EditFormState {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    pseudoName: user.pseudoName,
    email: user.email,
    role: user.role === USER_ROLE.ADMIN ? USER_ROLE.EMPLOYEE : user.role,
    password: "",
  };
}

function formatRole(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function AccountInput({
  id,
  label,
  placeholder,
  type = "text",
  icon: Icon,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="font-google-sans text-sm font-semibold text-heading"
      >
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function EditAccountDialog({
  user,
  onSubmit,
  isPending,
}: {
  user: UserRecord;
  onSubmit: (userId: string, input: AccountPayload) => Promise<unknown> | void;
  isPending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EditFormState>(() => buildInitialForm(user));

  function updateField<Key extends keyof EditFormState>(
    key: Key,
    value: EditFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(buildInitialForm(user));
    }

    setOpen(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(user.id, {
      firstName: form.firstName,
      lastName: form.lastName,
      pseudoName: form.pseudoName,
      email: form.email,
      role: form.role,
      password: form.password || undefined,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          aria-label={`Edit ${user.firstName} ${user.lastName}`}
          className="rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update account details, role access, or reset the user password.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <AccountInput
              id={`edit-first-name-${user.id}`}
              label="First Name"
              placeholder="John"
              icon={User}
              value={form.firstName}
              required
              onChange={(value) => updateField("firstName", value)}
            />
            <AccountInput
              id={`edit-last-name-${user.id}`}
              label="Last Name"
              placeholder="Doe"
              icon={User}
              value={form.lastName}
              required
              onChange={(value) => updateField("lastName", value)}
            />
            <AccountInput
              id={`edit-pseudo-name-${user.id}`}
              label="Pseudo Name"
              placeholder="Campaign Operator"
              icon={IdCard}
              value={form.pseudoName}
              required
              onChange={(value) => updateField("pseudoName", value)}
            />
            <AccountInput
              id={`edit-email-${user.id}`}
              label="Email"
              placeholder="name@axemail.com"
              type="email"
              icon={AtSign}
              value={form.email}
              required
              onChange={(value) => updateField("email", value)}
            />
            <AccountInput
              id={`reset-password-${user.id}`}
              label="Reset Password"
              placeholder="Enter a new password"
              type="password"
              icon={LockKeyhole}
              value={form.password}
              onChange={(value) => updateField("password", value)}
            />

            <div>
              <Label className="font-google-sans text-sm font-semibold text-heading">
                Role
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal"
                  >
                    <span className="flex items-center gap-2">
                      <UserRound className="size-4 text-muted-foreground" />
                      {formatRole(form.role)}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-(--radix-dropdown-menu-trigger-width)"
                >
                  {accountRoles.map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onSelect={() => updateField("role", value)}
                      className="font-inter"
                    >
                      <span className="grid w-4 place-items-center">
                        {form.role === value && <Check className="size-4" />}
                      </span>
                      {formatRole(value)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={isPending}
              className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2 text-primary-foreground">
                  Saving Account{" "}
                  <LoaderCircle className="size-4 animate-spin" />
                </span>
              ) : (
                "Edit Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
