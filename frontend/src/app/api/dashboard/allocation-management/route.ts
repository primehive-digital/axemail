import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET() {
  try {
    const result = await authenticatedBackendFetch("/api/dashboard/allocation-management");
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load allocation management data.");
  }
}