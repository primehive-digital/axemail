import { NextResponse } from "next/server";

import { getAuthUserFromCookies, updateAuthUserCookie } from "@/lib/auth/session-cookies";
import type { AuthUser } from "@/lib/auth/types";
import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET() {
  try {
    const result = await authenticatedBackendFetch("/api/profile");
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load profile.");
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await authenticatedBackendFetch<AuthUser>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const currentUser = await getAuthUserFromCookies();
    const updatedUser = currentUser ? { ...currentUser, ...result.data } : result.data;

    await updateAuthUserCookie(updatedUser);

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    return routeErrorResponse(error, "Unable to update profile.");
  }
}