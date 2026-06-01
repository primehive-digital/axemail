"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Inbox } from "lucide-react";

const hasUnreadNotifications = true;

export function Notification() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Notifications"
          className="relative px-2.5 py-2 text-white hover:bg-dark-muted hover:text-white"
        >
          <Bell strokeWidth={2.5} />
          {hasUnreadNotifications && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <div>
            <h2 className="font-google-sans text-base font-semibold text-heading">
              Notifications
            </h2>
            <p className="font-inter text-xs text-muted-foreground">
              New activity will appear here.
            </p>
          </div>
          {hasUnreadNotifications && (
            <span className="rounded-full bg-accent px-2 py-1 font-inter text-xs font-medium text-accent-foreground">
              New
            </span>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="grid place-items-center gap-2 px-4 py-8 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-5" />
          </span>
          <div>
            <h3 className="font-google-sans text-sm font-semibold text-heading">
              No notifications yet
            </h3>
            <p className="mt-1 font-inter text-xs leading-5 text-muted-foreground">
              You are all caught up for now.
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
