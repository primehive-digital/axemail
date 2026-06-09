import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET() {
  try {
    const result = await authenticatedBackendFetch("/api/mailer-customization");
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load mailer customization.");
  }
}
