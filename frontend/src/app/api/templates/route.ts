import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

export async function GET() {
  try {
    const result = await authenticatedBackendFetch("/api/templates");
    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to load templates.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await authenticatedBackendFetch("/api/templates", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error, "Unable to create template.");
  }
}