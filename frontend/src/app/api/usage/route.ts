import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET() {
  try {
    return NextResponse.json(await authenticatedBackendFetch("/api/usage"));
  } catch (error) {
    return routeErrorResponse(error, "Unable to load sender limits.");
  }
}
