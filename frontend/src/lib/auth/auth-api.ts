import { extractApiErrorMessage } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth/types";

type LoginInput = {
  email: string;
  password: string;
};

export type SessionResponse = {
  data: {
    user: AuthUser | null;
  };
  reason?: "missing" | "terminated" | "expired" | "deleted" | "invalid";
  message?: string;
};

export async function loginUser(input: LoginInput) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(payload, "Invalid email or password."));
  }

  return payload as SessionResponse;
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractApiErrorMessage(payload, "Unable to logout."));
  }
}

export async function getCurrentSession() {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      data: { user: null },
      reason: payload?.reason ?? "invalid",
      message: payload?.message,
    } satisfies SessionResponse;
  }

  return payload as SessionResponse;
}