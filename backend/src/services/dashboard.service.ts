import { DeliveryStatus, MailerType, Role } from "@prisma/client";

import { prisma } from "@/config/prisma";
import { buildMailerCooldown, listReplyToOptionsForMailer } from "@/services/mailer-customization.service";
import { listMailerPolicies } from "@/services/mailer-policy.service";
import { getMaskServerHealth } from "@/services/mask-server.service";
import { buildUserUsage, getMailerTypeDailyLimitMap } from "@/services/quota.service";
import { getSmtpMailerAccountMetrics, listSmtpMailerAccounts } from "@/services/smtp-mailer-account.service";
import { listUsers } from "@/services/user.service";
import { startOfTodayUtc } from "@/utils/date";
import { mapMailerType } from "@/utils/enum-mappers";

const mailerTypes = [MailerType.GMAIL, MailerType.DOMAIN, MailerType.MASK] as const;

export async function getOverviewDashboard(input: { userId: string; role: Role }) {
  const isEmployee = input.role === Role.EMPLOYEE;
  const todayStart = startOfTodayUtc();
  const trendStart = new Date(todayStart);
  trendStart.setUTCDate(trendStart.getUTCDate() - 6);
  const deliveryScope = isEmployee
    ? { userId: input.userId }
    : { user: { role: Role.EMPLOYEE } };

  const [sentTodayRows, trendDeliveries, allocationRows] = await Promise.all([
    prisma.deliveryRecord.groupBy({
      by: ["mailerType"],
      where: {
        ...deliveryScope,
        status: DeliveryStatus.SENT,
        OR: [
          { sentAt: { gte: todayStart } },
          { sentAt: null, createdAt: { gte: todayStart } },
        ],
      },
      _count: { _all: true },
    }),
    prisma.deliveryRecord.findMany({
      where: {
        ...deliveryScope,
        status: DeliveryStatus.SENT,
        OR: [
          { sentAt: { gte: trendStart } },
          { sentAt: null, createdAt: { gte: trendStart } },
        ],
      },
      select: { mailerType: true, sentAt: true, createdAt: true },
    }),
    prisma.userMailerAllocation.groupBy({
      by: ["mailerType"],
      where: isEmployee
        ? { userId: input.userId }
        : { user: { role: Role.EMPLOYEE } },
      _sum: { assignedLimit: true },
    }),
  ]);

  const sentToday = sentTodayRows.reduce<Record<MailerType, number>>(
    (totals, row) => {
      totals[row.mailerType] = row._count._all;
      return totals;
    },
    emptyMailerMap(),
  );
  const limits = toNumberMap(allocationRows);
  const mailers = mailerTypes.map((mailerType) =>
    buildOverviewMetric(mailerType, sentToday[mailerType], limits[mailerType]),
  );
  const collective = mailers.reduce(
    (total, metric) => ({
      sentToday: total.sentToday + metric.sentToday,
      dailyLimit: total.dailyLimit + metric.dailyLimit,
    }),
    { sentToday: 0, dailyLimit: 0 },
  );

  return {
    scope: isEmployee ? "personal" as const : "team" as const,
    mailers,
    collective: {
      key: "collective" as const,
      title: "Collective Mail Delivery",
      ...collective,
      remaining: Math.max(collective.dailyLimit - collective.sentToday, 0),
      progress: calculateProgress(collective.sentToday, collective.dailyLimit),
    },
    trend: buildDeliveryTrend(trendStart, trendDeliveries),
  };
}

export async function getDashboardMailerStatus(input: { userId: string; mailerType: MailerType }) {
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

export async function getUsageLimitsDashboard() {
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
        description: "Gmail mailboxes available for sending.",
      },
      {
        key: "totalDomains",
        title: "Total Domain Accounts",
        label: "Domain Accounts",
        value: metrics.totalDomainAccounts,
        description: "Domain SMTP accounts available for sending.",
      },
      {
        key: "totalServers",
        title: "Mask Servers",
        label: "Servers",
        value: metrics.totalServers,
        description: "Mask-mailer servers available for sending.",
      },
    ],
    limits: [
      buildResourceLimit("gmail", "Gmail", "Gmail sender pool", gmailLimit, metrics.gmailDailyCapacity),
      buildResourceLimit("domain", "Domain", "Domain sender pool", domainLimit, metrics.domainDailyCapacity),
      buildResourceLimit("mask", "Mask", "Mask sender pool", maskLimit, metrics.serverTotalCapacity),
    ],
  };
}

export async function getUserManagementDashboard(actorRole: Role) {
  return { users: await listUsers(actorRole) };
}

export async function getAllocationManagementDashboard() {
  const [pools, rows, employees] = await Promise.all([
    getMailerPoolSummary(),
    getAllocationRows(),
    prisma.user.findMany({
      where: { role: Role.EMPLOYEE },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
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
  const assignedMap = toNumberMap(assignedByType);
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
    const allocation = buildMailerValueMap(user.allocations);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      ...allocation,
      total: allocation.gmail + allocation.domain + allocation.mask,
    };
  });
}

function buildResourceLimit(key: "gmail" | "domain" | "mask", resource: string, description: string, perAccount: number, perDay: number) {
  const officeDaysPerMonth = 22;

  return { key, resource, description, perAccount, perDay, perMonth: perDay * officeDaysPerMonth, officeDaysPerMonth };
}

function getPolicyLimit(policies: Awaited<ReturnType<typeof listMailerPolicies>>, mailerType: "gmail" | "domain" | "mask", fallback: number) {
  return policies.find((policy) => policy.mailerType === mailerType)?.dailyLimit ?? fallback;
}

function toNumberMap(rows: Array<{ mailerType: MailerType; _sum: { assignedLimit: number | null } }>) {
  return rows.reduce<Record<MailerType, number>>((accumulator, row) => {
    accumulator[row.mailerType] = row._sum.assignedLimit ?? 0;
    return accumulator;
  }, emptyMailerMap());
}

function buildMailerValueMap(rows: Array<{ mailerType: MailerType; assignedLimit: number }>) {
  return rows.reduce(
    (accumulator, row) => {
      accumulator[mapMailerType(row.mailerType)] = row.assignedLimit;
      return accumulator;
    },
    { gmail: 0, domain: 0, mask: 0 },
  );
}

function emptyMailerMap() {
  return { [MailerType.GMAIL]: 0, [MailerType.DOMAIN]: 0, [MailerType.MASK]: 0 };
}

function buildOverviewMetric(mailerType: MailerType, sentToday: number, dailyLimit: number) {
  return {
    key: mapMailerType(mailerType),
    title: `Mails via ${formatMailerName(mailerType)}`,
    sentToday,
    dailyLimit,
    remaining: Math.max(dailyLimit - sentToday, 0),
    progress: calculateProgress(sentToday, dailyLimit),
  };
}

function calculateProgress(sent: number, limit: number) {
  return limit > 0 ? Math.round((sent / limit) * 100) : 0;
}

function buildDeliveryTrend(
  start: Date,
  deliveries: Array<{ mailerType: MailerType; sentAt: Date | null; createdAt: Date }>,
) {
  const rows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      gmail: 0,
      domain: 0,
      mask: 0,
      total: 0,
    };
  });
  const rowByDate = new Map(rows.map((row) => [row.date, row]));

  for (const delivery of deliveries) {
    const date = (delivery.sentAt ?? delivery.createdAt).toISOString().slice(0, 10);
    const row = rowByDate.get(date);
    if (!row) continue;
    const key = mapMailerType(delivery.mailerType);
    row[key] += 1;
    row.total += 1;
  }

  return rows;
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
