import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-api";
import { clearAuthCookies, getRefreshTokenFromCookies } from "@/lib/auth/session-cookies";

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookies();

  if (refreshToken) {
    await backendFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null);
  }

  await clearAuthCookies();

  return NextResponse.json({ data: { loggedOut: true } });
}
