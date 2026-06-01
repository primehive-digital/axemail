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

export type DashboardNavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardNavigationGroup = {
  categoryTitle: string;
  items: DashboardNavigationItem[];
};

export type DashboardNavigationEntry =
  | DashboardNavigationItem
  | DashboardNavigationGroup;

export const DashboardNavigationData: DashboardNavigationEntry[] = [
  {
    title: "Executive Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },

  {
    categoryTitle: "Outreach",
    items: [
      {
        title: "Gmail Mailer",
        href: "/outreach/gmail-mailer",
        icon: Mail,
      },
      {
        title: "Domain Mailer",
        href: "/outreach/domain-mailer",
        icon: Globe,
      },
      {
        title: "Mask Mailer",
        href: "/outreach/mask-mailer",
        icon: Shield,
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
      },
      {
        title: "Template Governance",
        href: "/outreach-enablement/template-governance",
        icon: Files,
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
      },
      {
        title: "Activity Insights",
        href: "/analytics/activity-insights",
        icon: Users,
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
      },
      {
        title: "Infrastructure Control",
        href: "/administration/infrastructure-control",
        icon: Server,
      },
      {
        title: "Allocation Management",
        href: "/administration/allocation-management",
        icon: PieChart,
      },
    ],
  },
] satisfies DashboardNavigationEntry[];

export function isDashboardNavigationGroup(
  entry: DashboardNavigationEntry
): entry is DashboardNavigationGroup {
  return "items" in entry;
}

export function getDashboardNavigationTitle(pathname: string) {
  const items = DashboardNavigationData.flatMap((entry) =>
    isDashboardNavigationGroup(entry) ? entry.items : [entry]
  );

  return (
    items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )?.title ?? "Dashboard"
  );
}
