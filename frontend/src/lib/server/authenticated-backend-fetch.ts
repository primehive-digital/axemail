import { NextResponse } from "next/server";

import { ApiRequestError } from "@/lib/api-client";
import { getAccessTokenFromCookies } from "@/lib/auth/session-cookies";
import { backendFetch } from "@/lib/server/backend-api";

export async function authenticatedBackendFetch<T>(path: string, init?: RequestInit) {
  const accessToken = await getAccessTokenFromCookies();

  if (!accessToken) {
    throw new ApiRequestError("Authentication required.", 401);
  }

  return backendFetch<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
}

export function routeErrorResponse(error: unknown, fallback = "Request failed.") {
  return NextResponse.json(
    { message: error instanceof Error ? error.message : fallback },
    { status: error instanceof ApiRequestError ? error.status : 400 },
  );
}
