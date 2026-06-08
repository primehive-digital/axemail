import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await authenticatedBackendFetch("/api/profile/password", {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update password.");
  }
}