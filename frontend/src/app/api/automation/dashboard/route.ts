import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET() {
  try {
    const result = await authenticatedBackendFetch("/api/automation/dashboard");
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load automation dashboard.");
  }
}