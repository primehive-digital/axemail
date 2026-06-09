import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authenticatedBackendFetch("/api/worker-limits/assign", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to assign worker limits.");
  }
}
