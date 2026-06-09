import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ optionId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { optionId } = await context.params;
    const body = await request.json();
    const result = await authenticatedBackendFetch(`/api/mailer-customization/reply-to-options/${optionId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update reply-to option.");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { optionId } = await context.params;
    const result = await authenticatedBackendFetch(`/api/mailer-customization/reply-to-options/${optionId}`, { method: "DELETE" });
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to delete reply-to option.");
  }
}
