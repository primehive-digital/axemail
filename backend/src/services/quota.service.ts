import { DeliveryStatus, Role, MailerType } from "@prisma/client";

import { prisma } from "@/config/prisma";
import type { MailerQuotaDto, UserUsageDto } from "@/types/api.types";
import { AppError } from "@/utils/app-error";
import { startOfTodayUtc } from "@/utils/date";
import { mapMailerType } from "@/utils/enum-mappers";

const mailerOrder = [MailerType.GMAIL, MailerType.DOMAIN, MailerType.MASK];
const countedDeliveryStatuses = [DeliveryStatus.QUEUED, DeliveryStatus.SENT] as const;

export async function getMailerTypeDailyLimitMap() {
  const [grouped, policies] = await Promise.all([
    prisma.smtpMailerAccount.groupBy({
      by: ["type"],
      where: { status: "ACTIVE" },
      _sum: { dailyLimit: true },
    }),
    prisma.mailerPolicy.findMany(),
  ]);

  const capacityMap = grouped.reduce<Record<MailerType, number>>(
    (accumulator, item) => {
      accumulator[item.type] = item._sum.dailyLimit ?? 0;
      return accumulator;
    },
    {
      [MailerType.GMAIL]: 0,
      [MailerType.DOMAIN]: 0,
      [MailerType.MASK]: 0,
    },
  );

  const maskPolicy = policies.find((item) => item.mailerType === MailerType.MASK);
  capacityMap[MailerType.MASK] = maskPolicy?.dailyLimit ?? 2000;

  return capacityMap;
}

async function getMailerTypeActiveCountMap() {
  const grouped = await prisma.smtpMailerAccount.groupBy({
    by: ["type"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
  });

  return grouped.reduce<Record<MailerType, number>>(
    (accumulator, item) => {
      accumulator[item.type] = item._count._all ?? 0;
      return accumulator;
    },
    {
      [MailerType.GMAIL]: 0,
      [MailerType.DOMAIN]: 0,
      [MailerType.MASK]: 1,
    },
  );
}

export async function getUsageByRole(): Promise<UserUsageDto[]> {
  const users = await prisma.user.findMany({
    where: { role: Role.EMPLOYEE },
    include: {
      allocations: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(users.map((user) => buildUserUsage(user.id)));
}

export async function buildUserUsage(userId: string): Promise<UserUsageDto> {
  const [allocationRows, usageRows, totalLimitMap] = await Promise.all([
    prisma.userMailerAllocation.findMany({
      where: { userId },
      orderBy: { mailerType: "asc" },
    }),
    prisma.deliveryRecord.groupBy({
      by: ["mailerType"],
      _count: { _all: true },
      where: {
        userId,
        createdAt: { gte: startOfTodayUtc() },
        status: { in: countedDeliveryStatuses as unknown as DeliveryStatus[] },
      },
    }),
    getMailerTypeDailyLimitMap(),
  ]);

  const usageByType = usageRows.reduce<Record<MailerType, number>>(
    (accumulator, row) => {
      accumulator[row.mailerType] += row._count._all;
      return accumulator;
    },
    {
      [MailerType.GMAIL]: 0,
      [MailerType.DOMAIN]: 0,
      [MailerType.MASK]: 0,
    },
  );

  const quotaMap = new Map(allocationRows.map((row) => [row.mailerType, row]));

  const mailerQuotas: MailerQuotaDto[] = mailerOrder.map((mailerType) => {
    const allocation = quotaMap.get(mailerType);
    const assignedLimit = allocation?.assignedLimit ?? 0;
    const used = usageByType[mailerType] ?? 0;
    const totalLimit = totalLimitMap[mailerType] ?? 0;

    return {
      id: allocation?.id ?? `${userId}-${mailerType.toLowerCase()}`,
      type: mapMailerType(mailerType),
      label: buildQuotaLabel(mailerType, userId),
      totalLimit,
      assignedLimit,
      used,
      remaining: Math.max(assignedLimit - used, 0),
    };
  });

  return {
    userId,
    mailerQuotas,
  };
}

export async function assignUserLimits(input: {
  userId: string;
  gmail: number;
  domain: number;
  mask: number;
}) {
  const targetUser = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!targetUser) {
    throw new AppError("Target user not found.", 404);
  }

  if (targetUser.role !== Role.EMPLOYEE) {
    throw new AppError("Mailer limits can only be assigned to employees.", 403);
  }

  const currentAllocations = await prisma.userMailerAllocation.findMany({
    where: { userId: input.userId },
  });

  const currentAllocationMap = new Map(
    currentAllocations.map((row) => [row.mailerType, row.assignedLimit]),
  );

  const [capacityMap, userAssignedByType, workerAssignedByType] = await Promise.all([
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
  ]);

  const assignedMap = sumAllocationGroups(userAssignedByType, workerAssignedByType);

  const rows: Array<{ mailerType: MailerType; assignedLimit: number }> = [
    { mailerType: MailerType.GMAIL, assignedLimit: input.gmail },
    { mailerType: MailerType.DOMAIN, assignedLimit: input.domain },
    { mailerType: MailerType.MASK, assignedLimit: input.mask },
  ];

  for (const row of rows) {
    const currentAssigned = currentAllocationMap.get(row.mailerType) ?? 0;
    const totalCapacity = capacityMap[row.mailerType] ?? 0;
    const remainingCapacity = Math.max(totalCapacity - assignedMap[row.mailerType], 0);
    const requestedIncrease = Math.max(row.assignedLimit - currentAssigned, 0);

    if (requestedIncrease > remainingCapacity) {
      throw new AppError("Assigned limit exceeds remaining mailer capacity.", 409, {
        mailerType: mapMailerType(row.mailerType),
        totalCapacity,
        currentlyAssigned: assignedMap[row.mailerType],
        currentUserAssigned: currentAssigned,
        requestedAssigned: row.assignedLimit,
        requestedIncrease,
        remainingCapacity,
      });
    }
  }

  await prisma.$transaction(
    rows.map((row) =>
      prisma.userMailerAllocation.upsert({
        where: {
          userId_mailerType: {
            userId: input.userId,
            mailerType: row.mailerType,
          },
        },
        create: {
          userId: input.userId,
          mailerType: row.mailerType,
          assignedLimit: row.assignedLimit,
        },
        update: {
          assignedLimit: row.assignedLimit,
        },
      }),
    ),
  );

  return buildUserUsage(input.userId);
}

export async function getMailerAvailability(input: {
  mailerType: MailerType;
  userId: string;
}) {
  const [capacityMap, activeCountMap, usage] = await Promise.all([
    getMailerTypeDailyLimitMap(),
    getMailerTypeActiveCountMap(),
    buildUserUsage(input.userId),
  ]);

  const quota = usage.mailerQuotas.find(
    (item) => item.type === mapMailerType(input.mailerType),
  );

  return {
    mailerType: mapMailerType(input.mailerType),
    dailyCapacity: capacityMap[input.mailerType] ?? 0,
    activeAccounts: activeCountMap[input.mailerType] ?? 0,
    quota,
  };
}

function buildQuotaLabel(mailerType: MailerType, userId: string) {
  if (mailerType === MailerType.GMAIL) {
    return "Gmail allocation";
  }

  if (mailerType === MailerType.DOMAIN) {
    return "Domain allocation";
  }

  return "Mask allocation";
}

export async function assignWorkerLimits(input: {
  workerId: string;
  gmail: number;
  domain: number;
  mask: number;
}) {
  const targetWorker = await prisma.automationWorker.findUnique({ where: { id: input.workerId } });

  if (!targetWorker) {
    throw new AppError("Target worker not found.", 404);
  }

  const currentAllocations = await prisma.automationWorkerMailerAllocation.findMany({ where: { workerId: input.workerId } });
  const currentAllocationMap = new Map(currentAllocations.map((row) => [row.mailerType, row.assignedLimit]));

  const [capacityMap, userAssignedByType, workerAssignedByType] = await Promise.all([
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
  ]);

  const assignedMap = sumAllocationGroups(userAssignedByType, workerAssignedByType);
  const rows: Array<{ mailerType: MailerType; assignedLimit: number }> = [
    { mailerType: MailerType.GMAIL, assignedLimit: input.gmail },
    { mailerType: MailerType.DOMAIN, assignedLimit: input.domain },
    { mailerType: MailerType.MASK, assignedLimit: input.mask },
  ];

  for (const row of rows) {
    const currentAssigned = currentAllocationMap.get(row.mailerType) ?? 0;
    const totalCapacity = capacityMap[row.mailerType] ?? 0;
    const remainingCapacity = Math.max(totalCapacity - assignedMap[row.mailerType], 0);
    const requestedIncrease = Math.max(row.assignedLimit - currentAssigned, 0);

    if (requestedIncrease > remainingCapacity) {
      throw new AppError("Assigned limit exceeds remaining mailer capacity.", 409, {
        mailerType: mapMailerType(row.mailerType),
        totalCapacity,
        currentlyAssigned: assignedMap[row.mailerType],
        currentWorkerAssigned: currentAssigned,
        requestedAssigned: row.assignedLimit,
        requestedIncrease,
        remainingCapacity,
      });
    }
  }

  await prisma.$transaction(
    rows.map((row) =>
      prisma.automationWorkerMailerAllocation.upsert({
        where: {
          workerId_mailerType: {
            workerId: input.workerId,
            mailerType: row.mailerType,
          },
        },
        create: {
          workerId: input.workerId,
          mailerType: row.mailerType,
          assignedLimit: row.assignedLimit,
        },
        update: {
          assignedLimit: row.assignedLimit,
        },
      }),
    ),
  );

  return { workerId: input.workerId };
}

function sumAllocationGroups(
  userRows: Array<{ mailerType: MailerType; _sum: { assignedLimit: number | null } }>,
  workerRows: Array<{ mailerType: MailerType; _sum: { assignedLimit: number | null } }>,
) {
  const assignedMap: Record<MailerType, number> = {
    [MailerType.GMAIL]: 0,
    [MailerType.DOMAIN]: 0,
    [MailerType.MASK]: 0,
  };

  for (const row of [...userRows, ...workerRows]) {
    assignedMap[row.mailerType] += row._sum.assignedLimit ?? 0;
  }

  return assignedMap;
}

