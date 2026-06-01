"use client";

import { useState } from "react";
import {
  AtSign,
  Check,
  ChevronDown,
  IdCard,
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

const accountRoles = [USER_ROLE.MANAGER, USER_ROLE.EMPLOYEE] satisfies UserRole[];

const accountFields = [
  {
    id: "edit-first-name",
    label: "First Name",
    placeholder: "Hassan",
    icon: User,
  },
  {
    id: "edit-last-name",
    label: "Last Name",
    placeholder: "Raza",
    icon: User,
  },
  {
    id: "edit-pseudo-name",
    label: "Pseudo Name",
    placeholder: "Campaign Operator",
    icon: IdCard,
  },
  {
    id: "edit-email",
    label: "Email",
    placeholder: "name@axemail.com",
    type: "email",
    icon: AtSign,
  },
  {
    id: "reset-password",
    label: "Reset Password",
    placeholder: "Enter a new password",
    type: "password",
    icon: LockKeyhole,
  },
];

function formatRole(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function AccountInput({
  id,
  label,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="font-google-sans text-sm font-semibold text-heading"
      >
        {label}
      </Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function EditAccountDialog({ defaultRole }: { defaultRole: UserRole }) {
  const [role, setRole] = useState<UserRole>(defaultRole);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          aria-label="Edit account"
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

        <div className="grid gap-4 md:grid-cols-2">
          {accountFields.map((field) => (
            <AccountInput key={field.id} {...field} />
          ))}

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
                    {formatRole(role)}
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
                    onSelect={() => setRole(value)}
                    className="font-inter"
                  >
                    <span className="grid w-4 place-items-center">
                      {role === value && <Check className="size-4" />}
                    </span>
                    {formatRole(value)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20">
            Edit Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
