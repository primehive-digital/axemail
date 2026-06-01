import type { Role, SenderType, UserStatus } from "@/constants/enums";

export type ApiResponse<T> = {
  data: T;
};

export type UserRecordDto = {
  id: string;
  firstName: string;
  lastName: string;
  pseudoName: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export type ProfileDto = {
  firstName: string;
  lastName: string;
  pseudoName: string;
  email: string;
};

export type SenderQuotaDto = {
  id: string;
  type: SenderType;
  label: string;
  totalLimit: number;
  assignedLimit: number;
  used: number;
  remaining: number;
};

export type UserUsageDto = {
  userId: string;
  senderQuotas: SenderQuotaDto[];
};

export type SenderAnalyticsDto = {
  assigned: number;
  used: number;
  remaining: number;
};

export type OverviewDto = {
  overall: {
    totalDelivered: number;
    totalAssigned: number;
    senders: Record<SenderType, SenderAnalyticsDto>;
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
  senderTargets: Record<SenderType, number>;
  senderTotals: Record<SenderType, number>;
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
