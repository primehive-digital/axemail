import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ mailerType: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { mailerType } = await context.params;
    const body = await request.json();
    const result = await authenticatedBackendFetch(`/api/mailer-customization/${mailerType}/cooldown`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update cooldown schedule.");
  }
}
