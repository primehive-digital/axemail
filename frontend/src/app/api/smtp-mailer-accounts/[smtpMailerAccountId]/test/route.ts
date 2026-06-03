import { NextResponse } from "next/server";

import { ApiRequestError } from "@/lib/api-client";
import { authenticatedBackendFetch, routeErrorResponse } from "@/lib/server/authenticated-backend-fetch";

type RouteContext = {
  params: Promise<{ smtpMailerAccountId: string }>;
};

type SmtpMailerAccount = {
  id: string;
  email: string;
};

async function testBackendSmtpAccount(smtpMailerAccountId: string) {
  return authenticatedBackendFetch(`/api/smtp-mailer-accounts/${smtpMailerAccountId}/test`, {
    method: "POST",
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { smtpMailerAccountId } = await context.params;
  const body = await request.json().catch(() => null) as { email?: string } | null;

  try {
    const result = await testBackendSmtpAccount(smtpMailerAccountId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404 && body?.email) {
      try {
        const accounts = await authenticatedBackendFetch<SmtpMailerAccount[]>("/api/smtp-mailer-accounts");
        const account = accounts.data.find((item) => item.email.toLowerCase() === body.email?.toLowerCase());

        if (account) {
          const result = await testBackendSmtpAccount(account.id);
          return NextResponse.json(result);
        }
      } catch (fallbackError) {
        return routeErrorResponse(fallbackError, "Unable to test SMTP mailer account.");
      }
    }

    return routeErrorResponse(error, "Unable to test SMTP mailer account.");
  }
}