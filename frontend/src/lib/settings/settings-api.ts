import { extractApiErrorMessage } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth/types";
import type { UserRole } from "@/constants/enum";

export type SettingsProfile = {
  firstName: string;
  lastName: string;
  pseudoName: string;
  email: string;
  role: UserRole;
};

export type UpdateSettingsProfilePayload = {
  firstName: string;
  lastName: string;
  pseudoName: string;
};

export type ChangeSettingsPasswordPayload = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function getSettingsProfile() {
  return requestJson<SettingsProfile>("/api/settings/profile");
}

export async function updateSettingsProfile(input: UpdateSettingsProfilePayload) {
  return requestJson<AuthUser>("/api/settings/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function changeSettingsPassword(input: ChangeSettingsPasswordPayload) {
  return requestJson<{ changed: boolean }>("/api/settings/password", {
    method: "PATCH",
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