import {
  BarChart3,
  FileText,
  Files,
  Globe,
  LayoutDashboard,
  Mail,
  PieChart,
  Gauge,
  Server,
  Shield,
  SlidersHorizontal,
  UserCog,
  type LucideIcon,
} from "lucide-react";

import { USER_ROLE, type UserRole } from "@/constants/enum";

export type DashboardNavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const employeeRoles = [USER_ROLE.EMPLOYEE];
const adminRoles = [USER_ROLE.ADMIN];
const adminManagerRoles = [USER_ROLE.ADMIN, USER_ROLE.MANAGER];
const allRoles = [USER_ROLE.ADMIN, USER_ROLE.MANAGER, USER_ROLE.EMPLOYEE];

export const DashboardNavigationData: DashboardNavigationItem[] = [
  { title: "Overview", href: "/overview", icon: LayoutDashboard, roles: allRoles },
  { title: "Template Sender", href: "/operations/template-sender", icon: FileText, roles: employeeRoles },
  { title: "My Limits", href: "/usage", icon: Gauge, roles: employeeRoles },
  { title: "Gmail Sender", href: "/outreach/gmail-mailer", icon: Mail, roles: employeeRoles },
  { title: "Domain Sender", href: "/outreach/domain-mailer", icon: Globe, roles: employeeRoles },
  { title: "Mask Sender", href: "/outreach/mask-mailer", icon: Shield, roles: employeeRoles },
  { title: "Template Governance", href: "/outreach-enablement/template-governance", icon: Files, roles: adminManagerRoles },
  { title: "Monthly Sending Report", href: "/reports/monthly-sending", icon: BarChart3, roles: adminManagerRoles },
  { title: "Usage & Limits", href: "/administration/usage-limits", icon: BarChart3, roles: adminRoles },
  { title: "User Management", href: "/administration/user-management", icon: UserCog, roles: adminManagerRoles },
  { title: "Sender Infrastructure", href: "/administration/infrastructure-control", icon: Server, roles: adminRoles },
  { title: "Allocation Management", href: "/administration/allocation-management", icon: PieChart, roles: adminManagerRoles },
  { title: "Sender Customization", href: "/administration/mailer-customization", icon: SlidersHorizontal, roles: adminManagerRoles },
];

export function getDashboardNavigationByRole(role: UserRole | null | undefined) {
  if (!role) return [];
  return DashboardNavigationData.filter((item) => item.roles.includes(role));
}

export function getDashboardNavigationTitle(pathname: string) {
  return DashboardNavigationData.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )?.title ?? "Dashboard";
}
