import { DeliveryStatus, Role, MailerType } from "@prisma/client";

import { prisma } from "@/config/prisma";
import type {
  PerformanceReportDailyDto,
  PerformanceReportDto,
  PerformanceReportEmployeeDto,
} from "@/types/api.types";
import { mapMailerType } from "@/utils/enum-mappers";
import { cleanupExpiredDeliveryRecords, getReportRetentionCutoff } from "@/services/report-retention.service";
import { AppError } from "@/utils/app-error";

const mailerTypes = [MailerType.GMAIL, MailerType.DOMAIN, MailerType.MASK] as const;

export async function getPerformanceReport(input: {
  month?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PerformanceReportDto> {
  await cleanupExpiredDeliveryRecords();

  const generatedAt = new Date();
  const availability = await getReportAvailability(generatedAt);
  const range = getReportRange(input, generatedAt, availability);

  const [users, deliveries] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.EMPLOYEE },
      include: { allocations: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.deliveryRecord.findMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: range.start,
              lt: range.endExclusive,
            },
          },
          {
            sentAt: {
              gte: range.start,
              lt: range.endExclusive,
            },
          },
        ],
        status: {
          in: [DeliveryStatus.SENT, DeliveryStatus.FAILED, DeliveryStatus.QUEUED],
        },
      },
      select: {
        userId: true,
        mailerType: true,
        status: true,
        createdAt: true,
        sentAt: true,
      },
    }),
  ]);

  const dayKeys = range.trackedDates;
  const deliveryMap = new Map<string, { sent: number; failed: number; queued: number }>();

  for (const delivery of deliveries) {
    const activityDate =
      delivery.status === DeliveryStatus.SENT ? delivery.sentAt ?? delivery.createdAt : delivery.createdAt;
    if (activityDate < range.start || activityDate >= range.endExclusive) {
      continue;
    }

    const key = buildDeliveryKey(delivery.userId, delivery.mailerType, toDateKey(activityDate));
    const current = deliveryMap.get(key) ?? { sent: 0, failed: 0, queued: 0 };

    if (delivery.status === DeliveryStatus.SENT) {
      current.sent += 1;
    } else if (delivery.status === DeliveryStatus.FAILED) {
      current.failed += 1;
    } else {
      current.queued += 1;
    }

    deliveryMap.set(key, current);
  }

  const employees = users.map<PerformanceReportEmployeeDto>((user) => {
    const mailerTargets = mailerTypes.reduce<Record<"gmail" | "domain" | "mask", number>>(
      (accumulator, mailerType) => {
        accumulator[mapMailerType(mailerType)] =
          user.allocations.find((allocation) => allocation.mailerType === mailerType)?.assignedLimit ?? 0;
        return accumulator;
      },
      { gmail: 0, domain: 0, mask: 0 },
    );
    const dailyTarget = mailerTargets.gmail + mailerTargets.domain + mailerTargets.mask;
    const monthTarget = dailyTarget * range.daysTracked;
    const daily = dayKeys.map<PerformanceReportDailyDto>((date) => {
      const gmail = deliveryMap.get(buildDeliveryKey(user.id, MailerType.GMAIL, date)) ?? emptyDeliveryCount();
      const domain = deliveryMap.get(buildDeliveryKey(user.id, MailerType.DOMAIN, date)) ?? emptyDeliveryCount();
      const mask = deliveryMap.get(buildDeliveryKey(user.id, MailerType.MASK, date)) ?? emptyDeliveryCount();

      return {
        date,
        gmail: gmail.sent,
        domain: domain.sent,
        mask: mask.sent,
        total: gmail.sent + domain.sent + mask.sent,
        failed: gmail.failed + domain.failed + mask.failed,
        queued: gmail.queued + domain.queued + mask.queued,
      };
    });
    const mailerTotals = {
      gmail: daily.reduce((total, day) => total + day.gmail, 0),
      domain: daily.reduce((total, day) => total + day.domain, 0),
      mask: daily.reduce((total, day) => total + day.mask, 0),
    };
    const totalSent = mailerTotals.gmail + mailerTotals.domain + mailerTotals.mask;
    const totalFailed = daily.reduce((total, day) => total + day.failed, 0);
    const totalQueued = daily.reduce((total, day) => total + day.queued, 0);
    const inactiveDays = dailyTarget === 0 ? 0 : daily.filter((day) => day.total === 0).length;

    return {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      pseudoName: user.pseudoName,
      email: user.email,
      dailyTarget,
      monthTarget,
      totalSent,
      totalFailed,
      totalQueued,
      remainingTarget: Math.max(monthTarget - totalSent, 0),
      completionRate: monthTarget === 0 ? 0 : Math.min(Math.round((totalSent / monthTarget) * 100), 100),
      isTargetMet: monthTarget > 0 && totalSent >= monthTarget,
      inactiveDays,
      mailerTargets,
      mailerTotals,
      daily,
    };
  });

  const summary = employees.reduce(
    (accumulator, employee) => {
      accumulator.totalSent += employee.totalSent;
      accumulator.totalFailed += employee.totalFailed;
      accumulator.totalQueued += employee.totalQueued;
      accumulator.totalTarget += employee.monthTarget;

      if (employee.monthTarget > 0) {
        if (employee.isTargetMet) {
          accumulator.targetMetEmployees += 1;
        } else {
          accumulator.behindTargetEmployees += 1;
        }
      }

      if (employee.totalSent === 0 && employee.dailyTarget > 0) {
        accumulator.inactiveEmployees += 1;
      }

      return accumulator;
    },
    {
      totalEmployees: employees.length,
      totalSent: 0,
      totalFailed: 0,
      totalQueued: 0,
      totalTarget: 0,
      targetMetEmployees: 0,
      behindTargetEmployees: 0,
      inactiveEmployees: 0,
    },
  );

  return {
    month: range.month,
    monthLabel: range.monthLabel,
    generatedAt: generatedAt.toISOString(),
    range: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      endExclusive: range.endExclusive.toISOString(),
      daysTracked: range.daysTracked,
      daysInMonth: range.daysInMonth,
      trackedDates: range.trackedDates,
    },
    availability: {
      start: availability.startDate,
      end: availability.endDate,
      months: availability.months,
    },
    summary,
    employees,
  };
}

async function getReportAvailability(now: Date) {
  const retentionStart = getReportRetentionCutoff(now);
  const firstRecord = await prisma.deliveryRecord.findFirst({
    where: {
      OR: [
        { createdAt: { gte: retentionStart } },
        { sentAt: { gte: retentionStart } },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true, sentAt: true },
  });
  const firstDate = firstRecord?.sentAt ?? firstRecord?.createdAt ?? now;
  const start = startOfUtcDay(firstDate < retentionStart ? retentionStart : firstDate);
  const end = startOfUtcDay(now);

  return {
    start,
    end,
    startDate: toDateKey(start),
    endDate: toDateKey(end),
    months: buildAvailableMonths(start, end),
  };
}

function getReportRange(
  input: {
    month?: string;
    startDate?: string;
    endDate?: string;
  },
  now: Date,
  availability: {
    start: Date;
    end: Date;
  },
) {
  if (input.startDate || input.endDate) {
    if (!input.startDate || !input.endDate) {
      throw new AppError("Start date and end date are required for range reports.", 400);
    }

    const requestedStart = parseDateKey(input.startDate);
    const requestedEnd = parseDateKey(input.endDate);

    if (requestedEnd < requestedStart) {
      throw new AppError("End date must be after start date.", 400);
    }

    const start = maxDate(requestedStart, availability.start);
    const end = minDate(requestedEnd, availability.end);
    const trackedDates = end < start ? [] : buildBusinessDayKeys(start, addUtcDays(end, 1));
    const endExclusive = end < start ? addUtcDays(start, 1) : addUtcDays(end, 1);

    return {
      month: input.startDate.slice(0, 7),
      monthLabel: `${input.startDate} to ${input.endDate}`,
      start,
      end,
      endExclusive,
      daysTracked: trackedDates.length,
      daysInMonth: trackedDates.length,
      trackedDates,
    };
  }

  const selectedMonth = input.month ?? `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [year, monthNumber] = selectedMonth.split("-").map(Number);
  const requestedStart = new Date(Date.UTC(year, monthNumber - 1, 1));
  const nextMonthStart = new Date(Date.UTC(year, monthNumber, 1));
  const isCurrentMonth = now >= requestedStart && now < nextMonthStart;
  const requestedEndExclusive = isCurrentMonth
    ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
    : nextMonthStart;
  const requestedEnd = addUtcDays(requestedEndExclusive, -1);
  const start = maxDate(requestedStart, availability.start);
  const end = minDate(requestedEnd, availability.end);
  const endExclusive = end < start ? addUtcDays(start, 1) : addUtcDays(end, 1);
  const trackedDates = end < start ? [] : buildBusinessDayKeys(start, endExclusive);
  const daysInMonth = buildBusinessDayKeys(requestedStart, nextMonthStart).length;

  return {
    month: selectedMonth,
    monthLabel: requestedStart.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
    start,
    end,
    endExclusive,
    daysTracked: trackedDates.length,
    daysInMonth,
    trackedDates,
  };
}

function buildBusinessDayKeys(start: Date, endExclusive: Date) {
  const dates: string[] = [];

  for (let current = start; current < endExclusive; current = addUtcDays(current, 1)) {
    if (isBusinessDay(current)) {
      dates.push(toDateKey(current));
    }
  }

  return dates;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (toDateKey(date) !== value) {
    throw new AppError("Invalid report date.", 400);
  }

  return date;
}

function addUtcDays(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isBusinessDay(date: Date) {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

function maxDate(left: Date, right: Date) {
  return left > right ? left : right;
}

function minDate(left: Date, right: Date) {
  return left < right ? left : right;
}

function buildAvailableMonths(start: Date, end: Date) {
  const months: string[] = [];

  for (
    let current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    current <= end;
    current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1))
  ) {
    months.push(toDateKey(current).slice(0, 7));
  }

  return months.reverse();
}

function buildDeliveryKey(userId: string, mailerType: MailerType, date: string) {
  return `${userId}:${mailerType}:${date}`;
}

function emptyDeliveryCount() {
  return { sent: 0, failed: 0, queued: 0 };
}
