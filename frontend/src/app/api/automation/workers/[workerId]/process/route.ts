import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function POST(request: Request, context: { params: Promise<{ workerId: string }> }) {
  try {
    const { workerId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const result = await authenticatedBackendFetch(`/api/automation/workers/${workerId}/process`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to process worker queue.");
  }
}