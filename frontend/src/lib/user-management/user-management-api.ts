import { extractApiErrorMessage } from "@/lib/api-client";
import type { UserRole, UserStatus } from "@/constants/enum";

export type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  pseudoName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type UserManagementMetric = {
  key: string;
  title: string;
  label: string;
  value: number;
};

export type UserManagementDashboardData = {
  metrics: UserManagementMetric[];
  users: UserRecord[];
};

export type AccountPayload = {
  firstName: string;
  lastName: string;
  pseudoName: string;
  email: string;
  role: Exclude<UserRole, "admin">;
  password?: string;
};

export async function getUserManagementDashboard() {
  return requestJson<UserManagementDashboardData>("/api/dashboard/user-management");
}

export async function createAccount(input: Required<AccountPayload>) {
  return requestJson<UserRecord>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAccount(userId: string, input: AccountPayload) {
  const body = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== ""),
  );

  return requestJson<UserRecord>(`/api/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAccount(userId: string) {
  return requestJson<{ deleted: boolean }>(`/api/users/${userId}`, {
    method: "DELETE",
  });
}

export async function terminateUserSession(userId: string) {
  return requestJson<{ terminated: boolean }>("/api/users/terminate-session", {
    method: "POST",
    body: JSON.stringify({ userId }),
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