"use client";

import type { DateRange } from "react-day-picker";

import type { MailerType } from "@/constants/enum";

export type BotActivityRatio = {
  sent: number;
  target: number;
};

export type BotIdentity = {
  id: string;
  name: string;
  pseudoName: string;
};

export type BotProgressTrackerRow = {
  bot: BotIdentity;
  gmail: BotActivityRatio;
  domain: BotActivityRatio;
  mask: BotActivityRatio;
  total: BotActivityRatio;
};

export type BotPerformanceRow = {
  botId: string;
  name: string;
  pseudoName: string;
  monthTarget: number;
  totalSent: number;
  completionRate: number;
  mailerTargets: Record<MailerType, number>;
  mailerTotals: Record<MailerType, number>;
};

export type BotPerformanceReport = {
  range: {
    daysTracked: number;
  };
  bots: BotPerformanceRow[];
};

const botTrackerSeed = [
  {
    bot: { id: "bot-01", name: "Atlas Bot", pseudoName: "atlas.dispatch" },
    gmail: { sent: 42, target: 60 },
    domain: { sent: 36, target: 50 },
    mask: { sent: 118, target: 160 },
  },
  {
    bot: { id: "bot-02", name: "Nova Bot", pseudoName: "nova.sequence" },
    gmail: { sent: 58, target: 70 },
    domain: { sent: 44, target: 55 },
    mask: { sent: 136, target: 170 },
  },
  {
    bot: { id: "bot-03", name: "Pulse Bot", pseudoName: "pulse.sender" },
    gmail: { sent: 27, target: 45 },
    domain: { sent: 31, target: 45 },
    mask: { sent: 92, target: 140 },
  },
  {
    bot: { id: "bot-04", name: "Orbit Bot", pseudoName: "orbit.mailer" },
    gmail: { sent: 64, target: 75 },
    domain: { sent: 52, target: 65 },
    mask: { sent: 151, target: 190 },
  },
  {
    bot: { id: "bot-05", name: "Vector Bot", pseudoName: "vector.batch" },
    gmail: { sent: 35, target: 55 },
    domain: { sent: 29, target: 45 },
    mask: { sent: 104, target: 150 },
  },
  {
    bot: { id: "bot-06", name: "Beacon Bot", pseudoName: "beacon.flow" },
    gmail: { sent: 49, target: 60 },
    domain: { sent: 40, target: 50 },
    mask: { sent: 126, target: 165 },
  },
] satisfies Array<Omit<BotProgressTrackerRow, "total">>;

export const botProgressTrackerRows: BotProgressTrackerRow[] = botTrackerSeed.map((row) => ({
  ...row,
  total: {
    sent: row.gmail.sent + row.domain.sent + row.mask.sent,
    target: row.gmail.target + row.domain.target + row.mask.target,
  },
}));

function getDaysTracked(dateRange: DateRange | undefined) {
  if (!dateRange?.from || !dateRange.to) {
    return 1;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / dayMs) + 1, 1);
}

export function getBotPerformanceReport(dateRange: DateRange | undefined): BotPerformanceReport {
  const daysTracked = getDaysTracked(dateRange);

  return {
    range: { daysTracked },
    bots: botProgressTrackerRows.map((row) => {
      const mailerTargets = {
        gmail: row.gmail.target,
        domain: row.domain.target,
        mask: row.mask.target,
      };
      const mailerTotals = {
        gmail: row.gmail.sent * daysTracked,
        domain: row.domain.sent * daysTracked,
        mask: row.mask.sent * daysTracked,
      };
      const monthTarget = (row.gmail.target + row.domain.target + row.mask.target) * daysTracked;
      const totalSent = mailerTotals.gmail + mailerTotals.domain + mailerTotals.mask;

      return {
        botId: row.bot.id,
        name: row.bot.name,
        pseudoName: row.bot.pseudoName,
        monthTarget,
        totalSent,
        completionRate: monthTarget > 0 ? Math.round((totalSent / monthTarget) * 100) : 0,
        mailerTargets,
        mailerTotals,
      };
    }),
  };
}
