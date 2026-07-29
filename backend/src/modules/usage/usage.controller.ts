import type { Request, Response } from "express";
import { Role } from "@prisma/client";

import { assignUserLimits, buildUserUsage, getMailerAvailability, getUsageByRole } from "@/services/quota.service";
import { asyncHandler } from "@/utils/async-handler";
import { assignLimitsSchema, mailerTypeParamSchema } from "@/modules/usage/usage.schemas";

export const getUsageHandler = asyncHandler(async (request: Request, response: Response) => {
  if (request.auth!.role === Role.EMPLOYEE) {
    response.json({ data: [await buildUserUsage(request.auth!.userId)] });
    return;
  }

  response.json({ data: await getUsageByRole() });
});

export const assignLimitsHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = assignLimitsSchema.parse({
    ...request.body,
    userId: request.params.userId ?? request.body.userId,
  });
  response.json({
    data: await assignUserLimits({
      ...payload,
    }),
  });
});

export const getMailerCardsHandler = asyncHandler(async (request: Request, response: Response) => {
  response.json({ data: (await buildUserUsage(request.auth!.userId)).mailerQuotas });
});

export const getMailerAvailabilityHandler = asyncHandler(async (request: Request, response: Response) => {
  const { mailerType } = mailerTypeParamSchema.parse(request.params);
  response.json({ data: await getMailerAvailability({ mailerType, userId: request.auth!.userId }) });
});


