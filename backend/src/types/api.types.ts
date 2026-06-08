import type { MailerType, UserRole, UserStatus } from "@/constants/enums";

export type ApiResponse<T> = {
  data: T;
};

export type UserRecordDto = {
  id: string;
  firstName: string;
  lastName: string;
  pseudoName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type ProfileDto = {
  firstName: string;
  lastName: string;
  pseudoName: string;
  email: string;
  role: UserRole;
};

export type MailerQuotaDto = {
  id: string;
  type: MailerType;
  label: string;
  totalLimit: number;
  assignedLimit: number;
  used: number;
  remaining: number;
};

export type UserUsageDto = {
  userId: string;
  mailerQuotas: MailerQuotaDto[];
};

export type MailerAnalyticsDto = {
  assigned: number;
  used: number;
  remaining: number;
};

export type OverviewDto = {
  overall: {
    totalDelivered: number;
    totalAssigned: number;
    mailers: Record<MailerType, MailerAnalyticsDto>;
  };
};

export type PerformanceReportDailyDto = {
  date: string;
  gmail: number;
  domain: number;
  mask: number;
  total: number;
  failed: number;
  queued: number;
};

export type PerformanceReportEmployeeDto = {
  userId: string;
  name: string;
  pseudoName: string;
  email: string;
  dailyTarget: number;
  monthTarget: number;
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  remainingTarget: number;
  completionRate: number;
  isTargetMet: boolean;
  inactiveDays: number;
  mailerTargets: Record<MailerType, number>;
  mailerTotals: Record<MailerType, number>;
  daily: PerformanceReportDailyDto[];
};

export type PerformanceReportDto = {
  month: string;
  monthLabel: string;
  generatedAt: string;
  range: {
    start: string;
    end: string;
    endExclusive: string;
    daysTracked: number;
    daysInMonth: number;
    trackedDates: string[];
  };
  availability: {
    start: string;
    end: string;
    months: string[];
  };
  summary: {
    totalEmployees: number;
    totalSent: number;
    totalFailed: number;
    totalQueued: number;
    totalTarget: number;
    targetMetEmployees: number;
    behindTargetEmployees: number;
    inactiveEmployees: number;
  };
  employees: PerformanceReportEmployeeDto[];
};
