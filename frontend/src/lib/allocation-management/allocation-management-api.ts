import { extractApiErrorMessage } from "@/lib/api-client";
import type { MailerType } from "@/constants/enum";

export type AllocationPool = {
  mailerType: MailerType | "total";
  title: string;
  description: string;
  assigned: number;
  limit: number;
  remaining: number;
  used: number;
};

export type AllocationUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AllocationRow = {
  user: AllocationUser;
  gmail: number;
  domain: number;
  mask: number;
  total: number;
};

export type AllocationManagementDashboardData = {
  pools: AllocationPool[];
  rows: AllocationRow[];
  assignableUsers: AllocationUser[];
};

export type AssignAllocationPayload = {
  userId: string;
  gmail: number;
  domain: number;
  mask: number;
};

export async function getAllocationManagementDashboard() {
  return requestJson<AllocationManagementDashboardData>("/api/dashboard/allocation-management");
}

export async function assignAllocation(input: AssignAllocationPayload) {
  return requestJson("/api/limits/assign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function requestJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(payload));
  }

  return payload.data as T;
}