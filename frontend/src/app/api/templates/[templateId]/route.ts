import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ templateId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { templateId } = await context.params;
    const body = await request.json();
    const result = await authenticatedBackendFetch(`/api/templates/${templateId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update template.");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { templateId } = await context.params;
    const result = await authenticatedBackendFetch(`/api/templates/${templateId}`, { method: "DELETE" });
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to delete template.");
  }
}