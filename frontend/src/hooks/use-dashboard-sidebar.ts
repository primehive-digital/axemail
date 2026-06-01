"use client";

import { useSidebar } from "@/components/ui/sidebar";

export function useDashboardSidebar() {
  const { state, open, openMobile, isMobile } = useSidebar();

  return {
    state,
    isDashboardSidebarOpen: state === "expanded",
    isDashboardSidebarCollapsed: state === "collapsed",
    isDashboardSidebarMobileOpen: isMobile && openMobile,
    isDashboardSidebarDesktopOpen: !isMobile && open,
  };
}
