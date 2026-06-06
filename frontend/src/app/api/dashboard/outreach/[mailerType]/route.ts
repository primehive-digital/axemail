import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ mailerType: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { mailerType } = await context.params;
    const result = await authenticatedBackendFetch(`/api/dashboard/outreach/${mailerType}`);
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load mailer status.");
  }
}