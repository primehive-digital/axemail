import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 70)",
            "--header-height": "calc(var(--spacing) * 20)",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar variant="inset" />
        <SidebarInset className="border-4 border-dark-border overflow-hidden">
          <DashboardHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
