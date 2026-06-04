import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.toString();
    const result = await authenticatedBackendFetch(`/api/dashboard/activity-insights${query ? `?${query}` : ""}`);
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load activity insights data.");
  }
}