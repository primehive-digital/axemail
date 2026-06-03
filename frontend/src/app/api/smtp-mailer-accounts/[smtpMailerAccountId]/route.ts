import { NextResponse } from "next/server";

import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ smtpMailerAccountId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { smtpMailerAccountId } = await context.params;
    const body = await request.json();
    const result = await authenticatedBackendFetch(`/api/smtp-mailer-accounts/${smtpMailerAccountId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to update SMTP mailer account.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { smtpMailerAccountId } = await context.params;
    const result = await authenticatedBackendFetch(`/api/smtp-mailer-accounts/${smtpMailerAccountId}`, {
      method: "DELETE",
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, "Unable to delete SMTP mailer account.");
  }
}