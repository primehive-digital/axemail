import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function PATCH(request: Request, context: { params: Promise<{ workerId: string }> }) {
  try {
    const { workerId } = await context.params;
    const body = await request.json();
    const result = await authenticatedBackendFetch(`/api/automation/workers/${workerId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update worker.");
  }
}