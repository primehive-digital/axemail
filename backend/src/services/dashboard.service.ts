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

async function getUserMetrics(actorRole: Role) {
  const where = actorRole === Role.MANAGER
    ? { role: Role.EMPLOYEE }
    : { role: { in: [Role.MANAGER, Role.EMPLOYEE] } };
  const users = await prisma.user.findMany({ where });

  return [
    { key: "totalUsers", title: "Total Users", label: "Accounts", value: users.length },
    { key: "totalManagers", title: "Total Managers", label: "Managers", value: users.filter((user) => user.role === Role.MANAGER).length },
    { key: "totalEmployees", title: "Total Employees", label: "Employees", value: users.filter((user) => user.role === Role.EMPLOYEE).length },
  ];
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
