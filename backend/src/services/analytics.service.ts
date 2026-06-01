import { Role, MailerType } from "@prisma/client";

import type { OverviewDto } from "@/types/api.types";
import { buildUserUsage, getUsageByRole } from "@/services/quota.service";

export async function getOverview(input: { role: Role; userId: string }): Promise<OverviewDto> {
  const visibleUsage =
    input.role === Role.EMPLOYEE
      ? [await buildUserUsage(input.userId)]
      : await getUsageByRole();

  const overall = visibleUsage.flatMap((usage) => usage.mailerQuotas).reduce(
    (accumulator, quota) => {
      const mailerType = quota.type.toUpperCase() as MailerType;
      accumulator[mailerType].assigned += quota.assignedLimit;
      accumulator[mailerType].used += quota.used;
      accumulator.totalAssigned += quota.assignedLimit;
      accumulator.totalUsed += quota.used;
      return accumulator;
    },
    {
      [MailerType.GMAIL]: { assigned: 0, used: 0 },
      [MailerType.DOMAIN]: { assigned: 0, used: 0 },
      [MailerType.MASK]: { assigned: 0, used: 0 },
      totalAssigned: 0,
      totalUsed: 0,
    },
  );

  return {
    overall: {
      totalDelivered: overall.totalUsed,
      totalAssigned: overall.totalAssigned,
      mailers: {
        gmail: {
          assigned: overall[MailerType.GMAIL].assigned,
          used: overall[MailerType.GMAIL].used,
          remaining: Math.max(
            overall[MailerType.GMAIL].assigned - overall[MailerType.GMAIL].used,
            0,
          ),
        },
        domain: {
          assigned: overall[MailerType.DOMAIN].assigned,
          used: overall[MailerType.DOMAIN].used,
          remaining: Math.max(
            overall[MailerType.DOMAIN].assigned - overall[MailerType.DOMAIN].used,
            0,
          ),
        },
        mask: {
          assigned: overall[MailerType.MASK].assigned,
          used: overall[MailerType.MASK].used,
          remaining: Math.max(
            overall[MailerType.MASK].assigned - overall[MailerType.MASK].used,
            0,
          ),
        },
      },
    },
  };
}
