import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET(request: NextRequest) {
  try {
    const mailerType = request.nextUrl.searchParams.get("mailerType") ?? "gmail";
    const result = await authenticatedBackendFetch(`/api/dashboard/template-sender?mailerType=${mailerType}`);
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load template sender dashboard.");
  }
}