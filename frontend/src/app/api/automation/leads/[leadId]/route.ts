import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ leadId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { leadId } = await context.params;
    const body = await request.json();
    const result = await authenticatedBackendFetch(`/api/automation/leads/${leadId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update lead.");
  }
}
