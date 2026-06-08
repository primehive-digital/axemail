"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/components/layouts/notification";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getDashboardNavigationTitle } from "@/constants/dashboard-navigation";
import { useDashboardSidebar } from "@/hooks/use-dashboard-sidebar";
import { cn } from "@/lib/utils";
import { LogOut, Settings } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/auth-slice";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const title = getDashboardNavigationTitle(pathname);
  const { isDashboardSidebarOpen } = useDashboardSidebar();
  const currentUser = {
    name: user ? `${user.firstName} ${user.lastName}` : "Axemail User",
    email: user?.email ?? "user@axemail.com",
    imageUrl: "",
  };
  const userInitials = getInitials(currentUser.name);
  const profileImageStyle = currentUser.imageUrl
    ? { backgroundImage: `url(${currentUser.imageUrl})` }
    : undefined;
  function handleOpenSettings() {
    router.push("/settings");
  }

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      dispatch(clearCredentials());
      toast.success("Logged out successfully.");
      router.replace("/");
      router.refresh();
    },
  });

  return (
    <header className="flex h-(--header-height) min-h-14 shrink-0 items-center gap-2 border-b overflow-hidden transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-black border-none">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hover:bg-dark-muted" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-8 rounded-full! my-auto bg-dark-border w-0.75!"
        />
        <h1 className="lg:text-3xl md:text-xl text-base text-dark-heading font-semibold">
          {title}
        </h1>
        <div className="ml-auto flex items-center md:gap-3 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-w-0 items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                aria-label={`Open profile for ${currentUser.name}`}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-dark-accent bg-cover bg-center font-google-sans text-sm font-bold text-primary-foreground"
                  style={profileImageStyle}
                >
                  {!currentUser.imageUrl && userInitials}
                </span>
                <span
                  className={cn(
                    "hidden min-w-0 overflow-hidden text-left opacity-100 transition-[max-width,opacity] duration-300 ease-linear md:max-lg:block md:max-lg:max-w-44 md:max-lg:opacity-100 lg:block lg:max-w-44 lg:opacity-100",
                    isDashboardSidebarOpen &&
                      "md:max-lg:max-w-0 md:max-lg:opacity-0",
                  )}
                >
                  <span className="block truncate font-google-sans text-sm font-medium leading-tight text-dark-heading">
                    {currentUser.name}
                  </span>
                  <span className="block truncate font-inter text-xs font-medium text-dark-muted-foreground">
                    {currentUser.email}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel className="font-google-sans text-heading font-semibold">
                Account Settings
              </DropdownMenuLabel>
              <div className="px-2 pb-2 font-inter text-xs text-muted-foreground">
                Manage your profile and workspace preferences.
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-google-sans cursor-pointer" onSelect={handleOpenSettings}>
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator
            orientation="vertical"
            className="hidden data-[orientation=vertical]:h-8 lg:block rounded-full! mx-2 my-auto bg-dark-border w-0.75!"
          />
          <Notification />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="group rounded-full bg-destructive text-destructive-foreground hover:bg-red-400 shadow-[#e7000b]/10 shadow-sm hover:shadow-md hover:shadow-[#e7000b]/20 transition-all ease-in-out duration-200 border-none">
                <LogOut strokeWidth={3} />
                <span
                  className={cn(
                    "hidden overflow-hidden whitespace-nowrap font-semibold font-google-sans text-destructive-foreground opacity-100 transition-[max-width,opacity] duration-300 ease-linear md:max-lg:inline-block md:max-lg:max-w-20 md:max-lg:opacity-100 lg:inline-block lg:max-w-20 lg:opacity-100",
                    isDashboardSidebarOpen &&
                      "md:max-lg:max-w-0 md:max-lg:opacity-0",
                  )}
                >
                  Logout
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/20 sm:max-w-md">
              <AlertDialogHeader className="place-items-start text-left">
                <AlertDialogMedia className="mb-2 size-12 bg-destructive/10 text-destructive max-md:hidden">
                  <LogOut className="size-6" />
                </AlertDialogMedia>
                <AlertDialogTitle className="font-google-sans text-xl font-semibold text-heading">
                  Are you sure you want to logout?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-inter text-sm leading-6 text-muted-foreground">
                  You will need to sign in again to access your Axemail
                  workspace and campaign operations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="border border-border bg-transparent font-google-sans text-heading hover:bg-muted hover:text-heading hover:shadow-md hover:shadow-black/20 shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive! shadow-sm font-google-sans shadow-[#e7000b]/10 transition-all text-destructive-foreground duration-200 ease-in-out hover:bg-red-400 hover:shadow-md hover:shadow-[#e7000b]/20 border border-border"
                  onClick={() => logoutMutation.mutate()}
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}
