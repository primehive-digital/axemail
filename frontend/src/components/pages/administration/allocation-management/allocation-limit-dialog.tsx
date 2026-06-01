"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Globe,
  Mail,
  PencilLine,
  Shield,
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

const allocationPools = [
  {
    label: "Gmail Remaining",
    value: 16,
    icon: Mail,
  },
  {
    label: "Domain Remaining",
    value: 12,
    icon: Globe,
  },
  {
    label: "Mask Remaining",
    value: 13,
    icon: Shield,
  },
];

const allocationUsers = [
  "Ayesha Khan",
  "Hassan Raza",
  "Mariam Siddiqui",
  "Usman Ali",
  "Sana Ahmed",
  "Bilal Sheikh",
  "Zara Malik",
];

function AllocationInput({
  id,
  label,
  icon: Icon,
  placeholder,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
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
          type="number"
          min={0}
          placeholder={placeholder}
          className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function AllocationLimitDialog() {
  const [selectedUser, setSelectedUser] = useState(allocationUsers[0]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
          <PencilLine className="size-4" />
          Assign / Edit Limits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Mailer Allocation</DialogTitle>
          <DialogDescription>
            Assign or update daily mailer limits for a user within the currently
            available pool.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          {allocationPools.map((pool) => {
            const Icon = pool.icon;

            return (
              <div
                key={pool.label}
                className="rounded-xl border-2 border-border bg-secondary p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-inter text-xs font-medium text-muted-foreground">
                    {pool.label}
                  </span>
                  <Icon className="size-4 text-heading" />
                </div>
                <p className="digits mt-3 text-3xl font-semibold leading-none">
                  {pool.value}
                </p>
              </div>
            );
          })}
        </div>

        <div>
          <Label className="font-google-sans text-sm font-semibold text-heading">
            Select User
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="mt-2 h-11 w-full justify-between rounded-sm bg-background px-4 font-inter font-normal"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <UserRound className="size-4 text-muted-foreground" />
                  <span className="truncate">{selectedUser}</span>
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              {allocationUsers.map((user) => (
                <DropdownMenuItem
                  key={user}
                  onSelect={() => setSelectedUser(user)}
                  className="font-inter"
                >
                  <span className="grid w-4 place-items-center">
                    {selectedUser === user && <Check className="size-4" />}
                  </span>
                  {user}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AllocationInput
            id="assign-gmail-limit"
            label="Assign Gmail Limit"
            icon={Mail}
            placeholder="0"
          />
          <AllocationInput
            id="assign-domain-limit"
            label="Assign Domain Limit"
            icon={Globe}
            placeholder="0"
          />
          <AllocationInput
            id="assign-mask-limit"
            label="Assign Mask Limit"
            icon={Shield}
            placeholder="0"
          />
        </div>

        <div className="flex justify-end">
          <Button className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20">
            Assign / Edit Allocation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
