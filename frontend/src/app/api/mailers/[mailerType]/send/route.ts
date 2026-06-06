import { NextRequest, NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ mailerType: string }>;
};

const backendPathByMailerType: Record<string, string> = {
  gmail: "/api/gmail-mailer/send",
  domain: "/api/domain-mailer/send",
  mask: "/api/mask-mailer/send",
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { mailerType } = await context.params;
    const backendPath = backendPathByMailerType[mailerType];

    if (!backendPath) {
      return NextResponse.json({ message: "Unsupported mailer type." }, { status: 400 });
    }

    const body = await request.json();
    const result = await authenticatedBackendFetch(backendPath, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error, "Unable to send mail.");
  }
}