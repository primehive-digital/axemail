import { extractApiErrorMessage } from "@/lib/api-client";

export type UserMailerQuota = {
  id: string;
  type: "gmail" | "domain" | "mask";
  label: string;
  totalLimit: number;
  assignedLimit: number;
  used: number;
  remaining: number;
};

export type UserUsage = {
  userId: string;
  mailerQuotas: UserMailerQuota[];
};

export async function getMyUsage() {
  const response = await fetch("/api/usage", { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) throw new Error(extractApiErrorMessage(payload, "Unable to load sender limits."));
  return (payload.data?.[0] ?? null) as UserUsage | null;
}
