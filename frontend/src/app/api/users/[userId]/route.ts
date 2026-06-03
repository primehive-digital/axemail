import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const result = await authenticatedBackendFetch(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update user.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const result = await authenticatedBackendFetch(`/api/users/${userId}`, {
      method: "DELETE",
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to delete user.");
  }
}