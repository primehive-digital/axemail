"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getDashboardNavigationByRole } from "@/constants/dashboard-navigation";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

import Logo from "../../../public/favicons/logo.svg";

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const navigation = getDashboardNavigationByRole(userRole);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const getNavigationButtonClassName = (href: string) =>
    cn(
      "group/nav-link h-11! rounded-sm bg-transparent text-white! hover:bg-white hover:text-black!",
      isActive(href) && "bg-white text-black",
    );

  const getNavigationTextClassName = (href: string) =>
    cn(
      "font-google-sans text-white group-hover/nav-link:text-black!",
      isActive(href) && "text-black!",
    );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="hover:bg-transparent!">
        <SidebarMenu className="hover:bg-transparent!">
          <SidebarMenuItem className="hover:bg-transparent!">
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:py-4 data-[slot=sidebar-menu-button]:px-2 bg-dark-muted border-4 border-dark-border hover:bg-dark-muted cursor-default"
            >
              <div className="flex items-center gap-2 h-fit">
                <div className="relative w-14 overflow-hidden">
                  <Image
                    src={Logo}
                    alt="Axemail"
                    className="h-auto w-full"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-xl text-dark-heading font-google-sans font-medium leading-tight tracking-tight">
                    Axemail
                  </h1>
                  <p className="text-xs text-dark-foreground font-medium font-inter">
                    Trademark Campaign Tool
                  </p>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                      className={getNavigationButtonClassName(item.href)}
                    >
                      <Link href={item.href}>
                        <Icon className="text-dark-accent" strokeWidth={2} />
                        <span className={getNavigationTextClassName(item.href)}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
