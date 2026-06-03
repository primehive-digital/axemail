import {
  LayoutDashboard,
  Mail,
  Globe,
  Shield,
  FileText,
  Activity,
  Users,
  UserCog,
  Server,
  type LucideIcon,
  PieChart,
  Bot,
  Files,
} from "lucide-react";

import { USER_ROLE, type UserRole } from "@/constants/enum";

export type DashboardNavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export type DashboardNavigationGroup = {
  categoryTitle: string;
  items: DashboardNavigationItem[];
};

export type DashboardNavigationEntry =
  | DashboardNavigationItem
  | DashboardNavigationGroup;

const allRoles = [USER_ROLE.ADMIN, USER_ROLE.MANAGER, USER_ROLE.EMPLOYEE];
const employeeRoles = [USER_ROLE.EMPLOYEE];
const managerRoles = [USER_ROLE.MANAGER];
const adminRoles = [USER_ROLE.ADMIN];
const adminManagerRoles = [USER_ROLE.ADMIN, USER_ROLE.MANAGER];

export const DashboardNavigationData: DashboardNavigationEntry[] = [
  {
    title: "Executive Overview",
    href: "/overview",
    icon: LayoutDashboard,
    roles: allRoles,
  },
  {
    categoryTitle: "Outreach",
    items: [
      {
        title: "Gmail Mailer",
        href: "/outreach/gmail-mailer",
        icon: Mail,
        roles: employeeRoles,
      },
      {
        title: "Domain Mailer",
        href: "/outreach/domain-mailer",
        icon: Globe,
        roles: employeeRoles,
      },
      {
        title: "Mask Mailer",
        href: "/outreach/mask-mailer",
        icon: Shield,
        roles: employeeRoles,
      },
    ],
  },
  {
    categoryTitle: "Operations",
    items: [
      {
        title: "Template Sender",
        href: "/operations/template-sender",
        icon: FileText,
        roles: employeeRoles,
      },
    ],
  },
  {
    categoryTitle: "Outreach Enablement",
    items: [
      {
        title: "Automation Orchestration",
        href: "/outreach-enablement/automation-orchestration",
        icon: Bot,
        roles: managerRoles,
      },
      {
        title: "Template Governance",
        href: "/outreach-enablement/template-governance",
        icon: Files,
        roles: managerRoles,
      },
    ],
  },
  {
    categoryTitle: "Analytics",
    items: [
      {
        title: "Resource Usage",
        href: "/analytics/resource-usage",
        icon: Activity,
        roles: allRoles,
      },
      {
        title: "Activity Insights",
        href: "/analytics/activity-insights",
        icon: Users,
        roles: adminRoles,
      },
    ],
  },
  {
    categoryTitle: "Administration",
    items: [
      {
        title: "User Management",
        href: "/administration/user-management",
        icon: UserCog,
        roles: adminManagerRoles,
      },
      {
        title: "Infrastructure Control",
        href: "/administration/infrastructure-control",
        icon: Server,
        roles: adminRoles,
      },
      {
        title: "Allocation Management",
        href: "/administration/allocation-management",
        icon: PieChart,
        roles: adminManagerRoles,
      },
    ],
  },
] satisfies DashboardNavigationEntry[];

export function isDashboardNavigationGroup(
  entry: DashboardNavigationEntry,
): entry is DashboardNavigationGroup {
  return "items" in entry;
}

export function getDashboardNavigationByRole(role: UserRole | null | undefined) {
  if (!role) {
    return [];
  }

  return DashboardNavigationData.flatMap<DashboardNavigationEntry>((entry) => {
    if (isDashboardNavigationGroup(entry)) {
      const items = entry.items.filter((item) => item.roles.includes(role));
      return items.length ? [{ ...entry, items }] : [];
    }

    return entry.roles.includes(role) ? [entry] : [];
  });
}

export function getDashboardNavigationTitle(pathname: string) {
  const items = DashboardNavigationData.flatMap((entry) =>
    isDashboardNavigationGroup(entry) ? entry.items : [entry],
  );

  return (
    items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.title ?? "Dashboard"
  );
}