import { DeliveryStatus, MailerType, Role, UserStatus } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { env } from "@/config/env";
import { getMaskServerHealth } from "@/services/mask-server.service";
import { getPerformanceReport } from "@/services/performance-report.service";
import { buildUserUsage, getMailerTypeDailyLimitMap } from "@/services/quota.service";
import { listMailerPolicies } from "@/services/mailer-policy.service";
import { getSmtpMailerAccountMetrics, listSmtpMailerAccounts } from "@/services/smtp-mailer-account.service";
import { listUsers } from "@/services/user.service";
import { mapMailerType, mapRole, mapUserStatus } from "@/utils/enum-mappers";
import { startOfTodayUtc } from "@/utils/date";

const mailerTypes = [MailerType.GMAIL, MailerType.DOMAIN, MailerType.MASK] as const;

export async function getDashboardOverview(input: { role: Role; userId: string }) {
  const usage = await getVisibleUsage(input);
  const summary = summarizeUsage(usage);

  return {
    metrics: [
      buildMetric("gmail", "Mails via Gmail Mailer", summary.gmail.used, summary.gmail.assigned),
      buildMetric("domain", "Mails via Domain Mailer", summary.domain.used, summary.domain.assigned),
      buildMetric("mask", "Mails via Mask Mailer", summary.mask.used, summary.mask.assigned),
      buildMetric("total", "Collective Mail Delivery", summary.total.used, summary.total.assigned),
    ],
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
    cooldown: buildCooldown(input.mailerType),
  };
}

export async function getTemplateSenderDashboard(input: { userId: string; mailerType: MailerType }) {
  const [status, templates] = await Promise.all([
    getDashboardMailerStatus({ role: Role.EMPLOYEE, userId: input.userId, mailerType: input.mailerType }),
    prisma.emailTemplate.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    settings: {
      mailerTypes: mailerTypes.map((mailerType) => ({ value: mapMailerType(mailerType), label: formatMailerName(mailerType) })),
      templates: templates.map((template) => ({
        value: template.key,
        label: template.name,
        description: template.description,
      })),
    },
    status,
    templateDetails: templates.map((template) => ({
      templateKey: template.key,
      fields: template.fields,
    })),
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

export async function getActivityInsightsDashboard(input: { month?: string; startDate?: string; endDate?: string }) {
  const [poolSummary, progressRows, performance] = await Promise.all([
    getMailerPoolSummary(),
    getTodayProgressRows(),
    getPerformanceReport(input),
  ]);

  return {
    progress: poolSummary.map((pool) => ({
      mailerType: pool.mailerType,
      title: `${pool.title} Progress`,
      description: `Today's ${pool.title.toLowerCase()} activity against the daily target.`,
      sent: pool.used,
      target: pool.assigned,
      percentage: calculatePercentage(pool.used, pool.assigned),
    })),
    tracker: progressRows,
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
  const [pools, rows, employees] = await Promise.all([
    getMailerPoolSummary(),
    getAllocationRows(),
    prisma.user.findMany({ where: { role: Role.EMPLOYEE }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }),
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

function buildCooldown(mailerType: MailerType) {
  if (mailerType === MailerType.MASK) {
    return { enabled: false, secondsRemaining: 0, progress: 0 };
  }

  const schedule = mailerType === MailerType.GMAIL ? env.GMAIL_COOLDOWN_SCHEDULE : env.DOMAIN_COOLDOWN_SCHEDULE;
  const seconds = schedule[0] ?? 20;

  return {
    enabled: true,
    secondsRemaining: seconds,
    progress: 100,
  };
}

async function getMailerPoolSummary() {
  const [capacityMap, assignedByType, usedByType] = await Promise.all([
    getMailerTypeDailyLimitMap(),
    prisma.userMailerAllocation.groupBy({
      by: ["mailerType"],
      where: { user: { role: Role.EMPLOYEE } },
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
  const assignedMap = toNumberMap(assignedByType, "assignedLimit");
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
  const [users, activeSessions] = await Promise.all([
    prisma.user.findMany({ where }),
    prisma.userSession.count({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: where,
      },
    }),
  ]);

  return [
    { key: "totalUsers", title: "Total Users", label: "Accounts", value: users.length },
    { key: "activeSessions", title: "Active Sessions", label: "Live", value: activeSessions },
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