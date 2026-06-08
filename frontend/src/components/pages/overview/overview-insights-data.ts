import { Bot, CheckCircle2, MailCheck, Medal, ShieldCheck, Trophy, UserRound } from "lucide-react";

export type OverviewActivity = {
  id: string;
  actorType: "employee" | "bot";
  actorName: string;
  actorEmail?: string;
  message: string;
  mailer: string;
  timestamp: string;
  tone: "success" | "info" | "warning";
};

export type OverviewLeaderboardEmployee = {
  id: string;
  name: string;
  email: string;
  progress: number;
  completed: number;
  target: number;
};

export const overviewActivities: OverviewActivity[] = [
  {
    id: "activity-01",
    actorType: "employee",
    actorName: "Alina Mirza",
    actorEmail: "alina.mirza@axemail.cloud",
    message: "completed her collective daily quota.",
    mailer: "Collective",
    timestamp: "2 min ago",
    tone: "success",
  },
  {
    id: "activity-02",
    actorType: "bot",
    actorName: "Trademark Notice Bot",
    message: "paused after finishing the scheduled morning batch.",
    mailer: "Automation",
    timestamp: "9 min ago",
    tone: "info",
  },
  {
    id: "activity-03",
    actorType: "employee",
    actorName: "Mahesh Unknown",
    actorEmail: "mahesh@axemail.cloud",
    message: "completed mask mailer quota.",
    mailer: "Mask",
    timestamp: "18 min ago",
    tone: "success",
  },
  {
    id: "activity-04",
    actorType: "employee",
    actorName: "Muhammad Afzal",
    actorEmail: "muhammad.afzal@axemail.cloud",
    message: "is behind on domain mailer quota.",
    mailer: "Domain",
    timestamp: "31 min ago",
    tone: "warning",
  },
  {
    id: "activity-05",
    actorType: "bot",
    actorName: "Domain Outreach Bot",
    message: "started the afternoon outreach window.",
    mailer: "Automation",
    timestamp: "44 min ago",
    tone: "info",
  },
  {
    id: "activity-06",
    actorType: "employee",
    actorName: "Asad Irfan",
    actorEmail: "asad.irfan@axemail.cloud",
    message: "completed Gmail mailer quota.",
    mailer: "Gmail",
    timestamp: "1 hr ago",
    tone: "success",
  },
];

export const topEmployees: OverviewLeaderboardEmployee[] = [
  { id: "top-01", name: "Alina Mirza", email: "alina.mirza@axemail.cloud", progress: 100, completed: 310, target: 310 },
  { id: "top-02", name: "Mahesh Unknown", email: "mahesh@axemail.cloud", progress: 96, completed: 288, target: 300 },
  { id: "top-03", name: "Asad Irfan", email: "asad.irfan@axemail.cloud", progress: 91, completed: 274, target: 300 },
];

export const behindEmployees: OverviewLeaderboardEmployee[] = [
  { id: "behind-01", name: "Muhammad Afzal", email: "muhammad.afzal@axemail.cloud", progress: 34, completed: 102, target: 300 },
  { id: "behind-02", name: "Sandeep Hamid", email: "sandeep.hamid@axemail.cloud", progress: 41, completed: 123, target: 300 },
  { id: "behind-03", name: "Talha Farooq", email: "talha.farooq@axemail.cloud", progress: 48, completed: 144, target: 300 },
];

export const activityToneMeta = {
  success: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  info: { icon: MailCheck, className: "bg-blue-50 text-blue-700 border-blue-200" },
  warning: { icon: ShieldCheck, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

export const actorIconMeta = {
  employee: UserRound,
  bot: Bot,
};

export const leaderboardModeMeta = {
  top: { icon: Trophy, title: "Good Employees", description: "Top quota completion today." },
  behind: { icon: Medal, title: "Wall of Shame", description: "Employees currently behind target." },
};