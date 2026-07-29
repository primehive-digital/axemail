import "server-only";

import { ApiRequestError, type ApiEnvelope, extractApiErrorMessage } from "@/lib/api-client";

const backendApiBaseUrl = process.env.BACKEND_API_BASE_URL;

if (!backendApiBaseUrl) {
  throw new Error("BACKEND_API_BASE_URL is not configured.");
}

export const BACKEND_API_BASE_URL = backendApiBaseUrl.replace(/\/+$/u, "");

export async function backendFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${BACKEND_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiRequestError(extractApiErrorMessage(payload), response.status);
  }

  return payload as ApiEnvelope<T>;
}
