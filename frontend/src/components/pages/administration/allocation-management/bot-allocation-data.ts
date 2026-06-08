"use client";

import { MAILER_TYPE } from "@/constants/enum";
import type { AllocationPool, AllocationRow } from "@/lib/allocation-management/allocation-management-api";

export const initialBotAllocationRows: AllocationRow[] = [
  {
    user: {
      id: "bot-01",
      firstName: "Atlas",
      lastName: "Bot",
      email: "atlas.dispatch",
    },
    gmail: 60,
    domain: 50,
    mask: 160,
    total: 270,
  },
  {
    user: {
      id: "bot-02",
      firstName: "Nova",
      lastName: "Bot",
      email: "nova.sequence",
    },
    gmail: 70,
    domain: 55,
    mask: 170,
    total: 295,
  },
  {
    user: {
      id: "bot-03",
      firstName: "Pulse",
      lastName: "Bot",
      email: "pulse.sender",
    },
    gmail: 45,
    domain: 45,
    mask: 140,
    total: 230,
  },
  {
    user: {
      id: "bot-04",
      firstName: "Orbit",
      lastName: "Bot",
      email: "orbit.mailer",
    },
    gmail: 75,
    domain: 65,
    mask: 190,
    total: 330,
  },
  {
    user: {
      id: "bot-05",
      firstName: "Vector",
      lastName: "Bot",
      email: "vector.batch",
    },
    gmail: 55,
    domain: 45,
    mask: 150,
    total: 250,
  },
  {
    user: {
      id: "bot-06",
      firstName: "Beacon",
      lastName: "Bot",
      email: "beacon.flow",
    },
    gmail: 60,
    domain: 50,
    mask: 165,
    total: 275,
  },
];

export function getBotAllocationUsers(rows: AllocationRow[]) {
  return rows.map((row) => row.user);
}

export function applyBotAllocationRows(rows: AllocationRow[], input: { userId: string; gmail: number; domain: number; mask: number }) {
  return rows.map((row) => {
    if (row.user.id !== input.userId) {
      return row;
    }

    return {
      ...row,
      gmail: input.gmail,
      domain: input.domain,
      mask: input.mask,
      total: input.gmail + input.domain + input.mask,
    };
  });
}

export function getBotRemainingPools(pools: AllocationPool[], botRows: AllocationRow[]) {
  const botAssigned = botRows.reduce(
    (total, row) => ({
      gmail: total.gmail + row.gmail,
      domain: total.domain + row.domain,
      mask: total.mask + row.mask,
    }),
    { gmail: 0, domain: 0, mask: 0 },
  );

  return pools.map((pool) => {
    if (pool.mailerType === MAILER_TYPE.GMAIL) {
      return { ...pool, remaining: Math.max(pool.remaining - botAssigned.gmail, 0) };
    }

    if (pool.mailerType === MAILER_TYPE.DOMAIN) {
      return { ...pool, remaining: Math.max(pool.remaining - botAssigned.domain, 0) };
    }

    if (pool.mailerType === MAILER_TYPE.MASK) {
      return { ...pool, remaining: Math.max(pool.remaining - botAssigned.mask, 0) };
    }

    return {
      ...pool,
      remaining: Math.max(pool.remaining - botAssigned.gmail - botAssigned.domain - botAssigned.mask, 0),
    };
  });
}
