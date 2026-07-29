import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-api";
import { setAuthCookies } from "@/lib/auth/session-cookies";
import type { AuthSession } from "@/lib/auth/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await backendFetch<AuthSession>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    await setAuthCookies(result.data);

    return NextResponse.json({ data: { user: result.data.user } });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to login." },
      { status: 401 },
    );
  }
}
