import { DeliveryStatus, MailerType, Role, UserStatus } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { getMaskServerHealth } from "@/services/mask-server.service";
import { getPerformanceReport } from "@/services/performance-report.service";
import { buildUserUsage, getMailerTypeDailyLimitMap } from "@/services/quota.service";
import { listMailerPolicies } from "@/services/mailer-policy.service";
import { buildMailerCooldown, listReplyToOptionsForMailer } from "@/services/mailer-customization.service";
import { getSmtpMailerAccountMetrics, listSmtpMailerAccounts } from "@/services/smtp-mailer-account.service";
import { listUsers } from "@/services/user.service";
import { mapMailerType, mapRole, mapUserStatus } from "@/utils/enum-mappers";
import { startOfTodayUtc } from "@/utils/date";

const mailerTypes = [MailerType.GMAIL, MailerType.DOMAIN, MailerType.MASK] as const;

export async function getDashboardOverview(input: { role: Role; userId: string }) {
  const [usage, leaderboard, activityFeed] = await Promise.all([
    getVisibleUsage(input),
    getOverviewLeaderboard(),
    getOverviewActivityFeed(),
  ]);
  const summary = summarizeUsage(usage);

  return {
    metrics: [
      buildMetric("gmail", "Mails via Gmail Mailer", summary.gmail.used, summary.gmail.assigned),
      buildMetric("domain", "Mails via Domain Mailer", summary.domain.used, summary.domain.assigned),
      buildMetric("mask", "Mails via Mask Mailer", summary.mask.used, summary.mask.assigned),
      buildMetric("total", "Collective Mail Delivery", summary.total.used, summary.total.assigned),
    ],
    leaderboard,
    activityFeed,
  };
}

export async function getDashboardMailerStatus(input: { role: Role; userId: string; mailerType: MailerType }) {
  const usage = await buildUserUsage(input.userId);
  const quota = usage.mailerQuotas.find((item) => item.type === mapMailerType(input.mailerType));

  return {
    mailerType: mapMailerType(input.mailerType),
    capacity: {
      title: `${formatMailerName(input.mailerType)} Capacity`,
      allotted: quota?.assignedLimit ?? 0,
      sent: quota?.used ?? 0,
      remaining: quota?.remaining ?? 0,
    },
    cooldown: await buildMailerCooldown(input.mailerType),
    replyToOptions: await listReplyToOptionsForMailer(input.mailerType),
  };
}

export async function getResourceUsageDashboard() {
  const [metrics, policies] = await Promise.all([
    getSmtpMailerAccountMetrics(),
    listMailerPolicies(),
  ]);
  const gmailLimit = getPolicyLimit(policies, "gmail", 150);
  const domainLimit = getPolicyLimit(policies, "domain", 200);
  const maskLimit = getPolicyLimit(policies, "mask", 2000);

  return {
    metrics: [
      {
        key: "totalGmailAccounts",
        title: "Total Gmail Accounts",
        label: "Gmail Accounts",
        value: metrics.totalGmailAccounts,
        description: "Gmail mailboxes in the mailer pool.",
      },
      {
        key: "totalDomains",
        title: "Total Domains",
        label: "Domains",
        value: metrics.totalDomainAccounts,
        description: "Domain SMTP accounts in the mailer pool.",
      },
      {
        key: "totalMailboxes",
        title: "Total Mailboxes",
        label: "Domain Mailboxes",
        value: metrics.totalDomainAccounts,
        description: "Domain mailboxes in the mailer pool.",
      },
      {
        key: "totalServers",
        title: "Total Servers",
        label: "Servers",
        value: metrics.totalServers,
        description: "Servers used in the mailer pool.",
      },
    ],
    limits: [
      buildResourceLimit("gmail", "Gmail", "Gmail mailer pool", gmailLimit, metrics.gmailDailyCapacity),
      buildResourceLimit("domain", "Domain", "Domain mailer pool", domainLimit, metrics.domainDailyCapacity),
      buildResourceLimit("mask", "Mask", "Mask mailer pool", maskLimit, metrics.serverTotalCapacity),
    ],
  };
}

export async function getActivityInsightsDashboard(input: {
  role: Role;
  userId: string;
  month?: string;
  startDate?: string;
  endDate?: string;
}) {
  const isEmployee = input.role === Role.EMPLOYEE;
  const [progress, tracker, performance] = await Promise.all([
    getActivityProgress(input),
    isEmployee ? Promise.resolve([]) : getTodayProgressRows(),
    isEmployee
      ? Promise.resolve(null)
      : getPerformanceReport({ month: input.month, startDate: input.startDate, endDate: input.endDate }),
  ]);

  return {
    role: mapRole(input.role),
    progress,
    tracker,
    performance,
  };
}

export async function getUserManagementDashboard(actorRole: Role) {
  const [users, metrics] = await Promise.all([
    listUsers(actorRole),
    getUserMetrics(actorRole),
  ]);

  return { metrics, users };
}

export async function getAllocationManagementDashboard() {
  const [pools, rows, workerRows, employees, workers] = await Promise.all([
    getMailerPoolSummary(),
    getAllocationRows(),
    getAutomationWorkerAllocationRows(),
    prisma.user.findMany({ where: { role: Role.EMPLOYEE }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }),
    prisma.automationWorker.findMany({ orderBy: [{ name: "asc" }], include: { allocations: true } }),
  ]);

  return {
    pools,
    rows,
    assignableUsers: employees.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })),
    workerRows,
    assignableWorkers: workers.map((worker) => ({
      id: worker.id,
      firstName: worker.name,
      lastName: "",
      email: worker.pseudoName,
    })),
  };
}

export async function getInfrastructureControlDashboard() {
  const [policies, accounts, maskServer] = await Promise.all([
    listMailerPolicies(),
    listSmtpMailerAccounts(),
    getMaskServerHealth(),
  ]);

  return {
    policies: mailerTypes.map((mailerType) => ({
      mailerType: mapMailerType(mailerType),
      title: `${formatMailerName(mailerType)} Policy`,
      description: buildPolicyDescription(mailerType),
      dailyLimit: getPolicyLimit(policies, mapMailerType(mailerType), defaultDailyLimit(mailerType)),
    })),
    smtpMailerAccounts: accounts.filter((account) => account.type !== "mask"),
    maskServer,
  };
}

async function getVisibleUsage(input: { role: Role; userId: string }) {
  if (input.role === Role.EMPLOYEE) {
    return [await buildUserUsage(input.userId)];
  }

  const users = await prisma.user.findMany({ where: { role: Role.EMPLOYEE }, select: { id: true } });
  return Promise.all(users.map((user) => buildUserUsage(user.id)));
}

function summarizeUsage(usage: Awaited<ReturnType<typeof buildUserUsage>>[]) {
  const initial = {
    gmail: { assigned: 0, used: 0 },
    domain: { assigned: 0, used: 0 },
    mask: { assigned: 0, used: 0 },
    total: { assigned: 0, used: 0 },
  };

  for (const item of usage) {
    for (const quota of item.mailerQuotas) {
      initial[quota.type].assigned += quota.assignedLimit;
      initial[quota.type].used += quota.used;
      initial.total.assigned += quota.assignedLimit;
      initial.total.used += quota.used;
    }
  }

  return initial;
}

function buildMetric(key: string, title: string, value: number, total: number) {
  return {
    key,
    title,
    label: "Sent Today",
    value,
    total,
  };
}

async function getMailerPoolSummary() {
  const [capacityMap, assignedByType, workerAssignedByType, usedByType] = await Promise.all([
    getMailerTypeDailyLimitMap(),
    prisma.userMailerAllocation.groupBy({
      by: ["mailerType"],
      where: { user: { role: Role.EMPLOYEE } },
      _sum: { assignedLimit: true },
    }),
    prisma.automationWorkerMailerAllocation.groupBy({
      by: ["mailerType"],
      _sum: { assignedLimit: true },
    }),
    prisma.deliveryRecord.groupBy({
      by: ["mailerType"],
      where: {
        createdAt: { gte: startOfTodayUtc() },
        status: DeliveryStatus.SENT,
      },
      _count: { _all: true },
    }),
  ]);
  const assignedMap = addMailerMaps(toNumberMap(assignedByType, "assignedLimit"), toNumberMap(workerAssignedByType, "assignedLimit"));
  const usedMap = usedByType.reduce<Record<MailerType, number>>((accumulator, row) => {
    accumulator[row.mailerType] = row._count._all;
    return accumulator;
  }, emptyMailerMap());
  const pools = mailerTypes.map((mailerType) => {
    const limit = capacityMap[mailerType] ?? 0;
    const assigned = assignedMap[mailerType] ?? 0;
    const used = usedMap[mailerType] ?? 0;

    return {
      mailerType: mapMailerType(mailerType),
      title: `${formatMailerName(mailerType)} Pool`,
      description: `Daily ${formatMailerName(mailerType).toLowerCase()} allocation.`,
      assigned,
      limit,
      remaining: Math.max(limit - assigned, 0),
      used,
    };
  });
  const total = pools.reduce(
    (accumulator, pool) => ({
      assigned: accumulator.assigned + pool.assigned,
      limit: accumulator.limit + pool.limit,
      remaining: accumulator.remaining + pool.remaining,
      used: accumulator.used + pool.used,
    }),
    { assigned: 0, limit: 0, remaining: 0, used: 0 },
  );

  return [
    ...pools,
    {
      mailerType: "total" as const,
      title: "Total Pool",
      description: "Combined daily allocation.",
      ...total,
    },
  ];
}

async function getActivityProgress(input: { role: Role; userId: string }) {
  const where = input.role === Role.EMPLOYEE ? { id: input.userId } : { role: Role.EMPLOYEE };
  const [assignedByType, usedByType] = await Promise.all([
    prisma.userMailerAllocation.groupBy({
      by: ["mailerType"],
      where: { user: where },
      _sum: { assignedLimit: true },
    }),
    prisma.deliveryRecord.groupBy({
      by: ["mailerType"],
      where: {
        user: where,
        createdAt: { gte: startOfTodayUtc() },
        status: DeliveryStatus.SENT,
      },
      _count: { _all: true },
    }),
  ]);
  const assignedMap = toNumberMap(assignedByType, "assignedLimit");
  const usedMap = usedByType.reduce<Record<MailerType, number>>((accumulator, row) => {
    accumulator[row.mailerType] = row._count._all;
    return accumulator;
  }, emptyMailerMap());
  const progress = mailerTypes.map((mailerType) => buildActivityProgressItem(mailerType, usedMap[mailerType], assignedMap[mailerType] ?? 0));
  const total = progress.reduce(
    (accumulator, item) => ({ sent: accumulator.sent + item.sent, target: accumulator.target + item.target }),
    { sent: 0, target: 0 },
  );

  return [
    ...progress,
    {
      mailerType: "total" as const,
      title: "Total Mailer Progress",
      description: "Combined activity across all assigned mailer limits today.",
      sent: total.sent,
      target: total.target,
      percentage: calculatePercentage(total.sent, total.target),
    },
  ];
}

function buildActivityProgressItem(mailerType: MailerType, sent: number, target: number) {
  return {
    mailerType: mapMailerType(mailerType),
    title: `${formatMailerName(mailerType)} Progress`,
    description: `Today's ${formatMailerName(mailerType).toLowerCase()} activity against the assigned daily target.`,
    sent,
    target,
    percentage: calculatePercentage(sent, target),
  };
}
async function getAllocationRows() {
  const users = await prisma.user.findMany({
    where: { role: Role.EMPLOYEE },
    include: { allocations: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return users.map((user) => {
    const allocation = buildMailerValueMap(user.allocations, "assignedLimit");
    const total = allocation.gmail + allocation.domain + allocation.mask;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      gmail: allocation.gmail,
      domain: allocation.domain,
      mask: allocation.mask,
      total,
    };
  });
}

async function getAutomationWorkerAllocationRows() {
  const workers = await prisma.automationWorker.findMany({
    include: { allocations: true },
    orderBy: [{ name: "asc" }],
  });

  return workers.map((worker) => {
    const allocation = buildMailerValueMap(worker.allocations, "assignedLimit");
    const total = allocation.gmail + allocation.domain + allocation.mask;

    return {
      user: {
        id: worker.id,
        firstName: worker.name,
        lastName: "",
        email: worker.pseudoName,
      },
      gmail: allocation.gmail,
      domain: allocation.domain,
      mask: allocation.mask,
      total,
    };
  });
}
type OverviewActivityMailerType = "gmail" | "domain" | "mask" | "collective";

type OverviewActivityItem = {
  id: string;
  actorType: "employee";
  actorName: string;
  actorEmail: string;
  message: string;
  mailer: string;
  mailerType: OverviewActivityMailerType;
  occurredAt: string;
  tone: "success" | "warning";
};

function getDeliveryActivityDate(delivery: { sentAt: Date | null; createdAt: Date }) {
  return delivery.sentAt ?? delivery.createdAt;
}

function getShortMailerLabel(mailerType: MailerType | "collective") {
  if (mailerType === MailerType.GMAIL) return "Gmail";
  if (mailerType === MailerType.DOMAIN) return "Domain";
  if (mailerType === MailerType.MASK) return "Mask";
  return "Collective";
}

function getActivityMailerType(mailerType: MailerType | "collective"): OverviewActivityMailerType {
  if (mailerType === MailerType.GMAIL) return "gmail";
  if (mailerType === MailerType.DOMAIN) return "domain";
  if (mailerType === MailerType.MASK) return "mask";
  return "collective";
}

function isShiftWarningWindow(now: Date) {
  const pakistanHour = (now.getUTCHours() + 5) % 24;
  return pakistanHour >= 4 && pakistanHour < 6;
}

function buildQuotaCompletionActivity(input: {
  userId: string;
  actorName: string;
  actorEmail: string;
  mailerType: MailerType | "collective";
  target: number;
  completedAt: Date;
}): OverviewActivityItem {
  const label = getShortMailerLabel(input.mailerType);

  return {
    id: `quota-completed:${input.userId}:${label.toLowerCase()}`,
    actorType: "employee",
    actorName: input.actorName,
    actorEmail: input.actorEmail,
    message: input.mailerType === "collective" ? "completed the collective daily quota." : `completed the ${label} quota.`,
    mailer: label,
    mailerType: getActivityMailerType(input.mailerType),
    occurredAt: input.completedAt.toISOString(),
    tone: "success",
  };
}

function buildQuotaWarningActivity(input: {
  userId: string;
  actorName: string;
  actorEmail: string;
  mailerType: MailerType | "collective";
  sent: number;
  target: number;
  occurredAt: Date;
}): OverviewActivityItem {
  const label = getShortMailerLabel(input.mailerType);
  const remaining = Math.max(input.target - input.sent, 0);

  return {
    id: `quota-warning:${input.userId}:${label.toLowerCase()}`,
    actorType: "employee",
    actorName: input.actorName,
    actorEmail: input.actorEmail,
    message: input.mailerType === "collective"
      ? `has not completed the daily quota. ${remaining} mails remaining.`
      : `has not completed the ${label} quota. ${remaining} mails remaining.`,
    mailer: label,
    mailerType: getActivityMailerType(input.mailerType),
    occurredAt: input.occurredAt.toISOString(),
    tone: "warning",
  };
}

async function getOverviewActivityFeed() {
  const todayStart = startOfTodayUtc();
  const now = new Date();
  const [users, deliveries] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.EMPLOYEE },
      include: { allocations: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.deliveryRecord.findMany({
      where: {
        user: { role: Role.EMPLOYEE },
        createdAt: { gte: todayStart },
        status: DeliveryStatus.SENT,
      },
      select: {
        userId: true,
        mailerType: true,
        sentAt: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "asc" }],
    }),
  ]);
  const activities: OverviewActivityItem[] = [];
  const warningWindowActive = isShiftWarningWindow(now);

  for (const user of users) {
    const actorName = `${user.firstName} ${user.lastName}`;
    const target = buildMailerValueMap(user.allocations, "assignedLimit");
    const userDeliveries = deliveries
      .filter((delivery) => delivery.userId === user.id)
      .sort((first, second) => getDeliveryActivityDate(first).getTime() - getDeliveryActivityDate(second).getTime());
    const sent = {
      gmail: userDeliveries.filter((delivery) => delivery.mailerType === MailerType.GMAIL),
      domain: userDeliveries.filter((delivery) => delivery.mailerType === MailerType.DOMAIN),
      mask: userDeliveries.filter((delivery) => delivery.mailerType === MailerType.MASK),
    };
    const completionCandidates = [
      { mailerType: MailerType.GMAIL, sentCount: sent.gmail.length, target: target.gmail, deliveries: sent.gmail },
      { mailerType: MailerType.DOMAIN, sentCount: sent.domain.length, target: target.domain, deliveries: sent.domain },
      { mailerType: MailerType.MASK, sentCount: sent.mask.length, target: target.mask, deliveries: sent.mask },
    ];

    for (const candidate of completionCandidates) {
      if (candidate.target > 0 && candidate.sentCount >= candidate.target) {
        const completionDelivery = candidate.deliveries[candidate.target - 1];
        activities.push(buildQuotaCompletionActivity({
          userId: user.id,
          actorName,
          actorEmail: user.email,
          mailerType: candidate.mailerType,
          target: candidate.target,
          completedAt: getDeliveryActivityDate(completionDelivery),
        }));
      }
    }

    const totalTarget = target.gmail + target.domain + target.mask;
    const totalSent = userDeliveries.length;

    if (totalTarget > 0 && totalSent >= totalTarget) {
      activities.push(buildQuotaCompletionActivity({
        userId: user.id,
        actorName,
        actorEmail: user.email,
        mailerType: "collective",
        target: totalTarget,
        completedAt: getDeliveryActivityDate(userDeliveries[totalTarget - 1]),
      }));
    }

    if (warningWindowActive && totalTarget > 0 && totalSent < totalTarget) {
      activities.push(buildQuotaWarningActivity({
        userId: user.id,
        actorName,
        actorEmail: user.email,
        mailerType: "collective",
        sent: totalSent,
        target: totalTarget,
        occurredAt: now,
      }));
    }

    if (warningWindowActive) {
      const warningCandidates = [
        { mailerType: MailerType.GMAIL, sentCount: sent.gmail.length, target: target.gmail },
        { mailerType: MailerType.DOMAIN, sentCount: sent.domain.length, target: target.domain },
        { mailerType: MailerType.MASK, sentCount: sent.mask.length, target: target.mask },
      ];

      for (const candidate of warningCandidates) {
        if (candidate.target > 0 && candidate.sentCount < candidate.target) {
          activities.push(buildQuotaWarningActivity({
            userId: user.id,
            actorName,
            actorEmail: user.email,
            mailerType: candidate.mailerType,
            sent: candidate.sentCount,
            target: candidate.target,
            occurredAt: now,
          }));
        }
      }
    }
  }

  return {
    items: activities
      .sort((first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime())
      .slice(0, 40),
    generatedAt: now.toISOString(),
    shiftWarningActive: warningWindowActive,
  };
}
function buildOverviewLeaderboardRow(row: Awaited<ReturnType<typeof getTodayProgressRows>>[number]) {
  return {
    id: row.user.id,
    name: `${row.user.firstName} ${row.user.lastName}`,
    email: row.user.email,
    progress: calculatePercentage(row.total.sent, row.total.target),
    completed: row.total.sent,
    target: row.total.target,
    remaining: Math.max(row.total.target - row.total.sent, 0),
  };
}

async function getOverviewLeaderboard() {
  const progressRows = await getTodayProgressRows();
  const totalSent = progressRows.reduce((total, row) => total + row.total.sent, 0);

  if (totalSent === 0) {
    return {
      leaders: [],
      behind: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const rankedRows = progressRows
    .filter((row) => row.total.target > 0)
    .map(buildOverviewLeaderboardRow);
  const leaders = [...rankedRows]
    .filter((row) => row.completed > 0)
    .sort((first, second) => second.progress - first.progress || second.completed - first.completed || first.remaining - second.remaining)
    .slice(0, 3);
  const behind = [...rankedRows]
    .filter((row) => row.completed < row.target)
    .sort((first, second) => first.progress - second.progress || second.remaining - first.remaining || first.completed - second.completed)
    .slice(0, 3);

  return {
    leaders,
    behind,
    generatedAt: new Date().toISOString(),
  };
}
async function getTodayProgressRows() {
  const users = await prisma.user.findMany({
    where: { role: Role.EMPLOYEE },
    include: { allocations: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
  const sentRows = await prisma.deliveryRecord.groupBy({
    by: ["userId", "mailerType"],
    where: {
      createdAt: { gte: startOfTodayUtc() },
      status: DeliveryStatus.SENT,
    },
    _count: { _all: true },
  });
  const sentMap = new Map(sentRows.map((row) => [`${row.userId}:${row.mailerType}`, row._count._all]));

  return users.map((user) => {
    const target = buildMailerValueMap(user.allocations, "assignedLimit");
    const sent = {
      gmail: sentMap.get(`${user.id}:${MailerType.GMAIL}`) ?? 0,
      domain: sentMap.get(`${user.id}:${MailerType.DOMAIN}`) ?? 0,
      mask: sentMap.get(`${user.id}:${MailerType.MASK}`) ?? 0,
    };
    const totalSent = sent.gmail + sent.domain + sent.mask;
    const totalTarget = target.gmail + target.domain + target.mask;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      gmail: { sent: sent.gmail, target: target.gmail },
      domain: { sent: sent.domain, target: target.domain },
      mask: { sent: sent.mask, target: target.mask },
      total: { sent: totalSent, target: totalTarget },
    };
  });
}

async function getUserMetrics(actorRole: Role) {
  const where = actorRole === Role.MANAGER ? { role: Role.EMPLOYEE } : { role: { in: [Role.MANAGER, Role.EMPLOYEE] } };
  const users = await prisma.user.findMany({ where });

  return [
    { key: "totalUsers", title: "Total Users", label: "Accounts", value: users.length },
    { key: "totalManagers", title: "Total Managers", label: "Managers", value: users.filter((user) => user.role === Role.MANAGER).length },
    { key: "totalEmployees", title: "Total Employees", label: "Employees", value: users.filter((user) => user.role === Role.EMPLOYEE).length },
  ];
}

function buildResourceLimit(key: "gmail" | "domain" | "mask", resource: string, description: string, perAccount: number, perDay: number) {
  const officeDaysPerMonth = 22;

  return {
    key,
    resource,
    description,
    perAccount,
    perDay,
    perMonth: perDay * officeDaysPerMonth,
    officeDaysPerMonth,
  };
}

function getPolicyLimit(policies: Awaited<ReturnType<typeof listMailerPolicies>>, mailerType: "gmail" | "domain" | "mask", fallback: number) {
  return policies.find((policy) => policy.mailerType === mailerType)?.dailyLimit ?? fallback;
}

function toNumberMap(rows: Array<{ mailerType: MailerType; _sum: { assignedLimit: number | null } }>, key: "assignedLimit") {
  return rows.reduce<Record<MailerType, number>>((accumulator, row) => {
    accumulator[row.mailerType] = row._sum[key] ?? 0;
    return accumulator;
  }, emptyMailerMap());
}

function buildMailerValueMap(rows: Array<{ mailerType: MailerType; assignedLimit: number }>, key: "assignedLimit") {
  return rows.reduce(
    (accumulator, row) => {
      accumulator[mapMailerType(row.mailerType)] = row[key];
      return accumulator;
    },
    { gmail: 0, domain: 0, mask: 0 },
  );
}

function emptyMailerMap() {
  return {
    [MailerType.GMAIL]: 0,
    [MailerType.DOMAIN]: 0,
    [MailerType.MASK]: 0,
  };
}

function calculatePercentage(value: number, total: number) {
  return total === 0 ? 0 : Math.min(Math.round((value / total) * 100), 100);
}

function formatMailerName(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return "Gmail Mailer";
  if (mailerType === MailerType.DOMAIN) return "Domain Mailer";
  return "Mask Mailer";
}

function buildPolicyDescription(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return "Daily sending limit applied to each Gmail account.";
  if (mailerType === MailerType.DOMAIN) return "Daily sending limit applied to each domain mailbox account.";
  return "Daily sending limit applied to each server.";
}

function defaultDailyLimit(mailerType: MailerType) {
  if (mailerType === MailerType.GMAIL) return 150;
  if (mailerType === MailerType.DOMAIN) return 200;
  return 2000;
}
function addMailerMaps(left: Record<MailerType, number>, right: Record<MailerType, number>) {
  return {
    [MailerType.GMAIL]: (left[MailerType.GMAIL] ?? 0) + (right[MailerType.GMAIL] ?? 0),
    [MailerType.DOMAIN]: (left[MailerType.DOMAIN] ?? 0) + (right[MailerType.DOMAIN] ?? 0),
    [MailerType.MASK]: (left[MailerType.MASK] ?? 0) + (right[MailerType.MASK] ?? 0),
  };
}




