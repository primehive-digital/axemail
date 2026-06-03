import { NextResponse } from "next/server";

import { authenticatedBackendFetch } from "@/lib/server/authenticated-backend-fetch";
import { clearAuthCookies, getAuthUserFromCookies } from "@/lib/auth/session-cookies";

function getSessionFailureReason(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("terminated") || normalizedMessage.includes("revoked")) {
    return "terminated";
  }

  if (normalizedMessage.includes("expired")) {
    return "expired";
  }

  if (
    normalizedMessage.includes("not active") ||
    normalizedMessage.includes("not available") ||
    normalizedMessage.includes("not found")
  ) {
    return "deleted";
  }

  return "invalid";
}

export async function GET() {
  const user = await getAuthUserFromCookies();

  if (!user) {
    return NextResponse.json({ data: { user: null }, reason: "missing" }, { status: 401 });
  }

  try {
    await authenticatedBackendFetch("/api/profile");
    return NextResponse.json({ data: { user } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Session is no longer active.";

    await clearAuthCookies();

    return NextResponse.json(
      {
        data: { user: null },
        reason: getSessionFailureReason(message),
        message,
      },
      { status: 401 },
    );
  }
}