import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await authenticatedBackendFetch("/api/mailer-customization/reply-to-options", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error, "Unable to add reply-to option.");
  }
}
