import { NextRequest, NextResponse } from "next/server";

import { ApiRequestError, extractApiErrorMessage } from "@/lib/api-client";
import { getAccessTokenFromCookies } from "@/lib/auth/session-cookies";
import { routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";
import { BACKEND_API_BASE_URL } from "@/lib/server/backend-api";

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromCookies();

    if (!accessToken) {
      throw new ApiRequestError("Authentication required.", 401);
    }

    const query = request.nextUrl.searchParams.toString();
    const response = await fetch(`${BACKEND_API_BASE_URL}/api/reports/employee-performance/export${query ? `?${query}` : ""}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new ApiRequestError(extractApiErrorMessage(payload), response.status);
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
        "Content-Disposition": response.headers.get("Content-Disposition") ?? "attachment",
      },
    });
  } catch (error) {
    return routeErrorResponse(error, "Unable to download employee performance report.");
  }
}
