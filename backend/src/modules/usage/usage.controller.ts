import type { Request, Response } from "express";
import { Role } from "@prisma/client";

import { getOverview } from "@/services/analytics.service";
import { assignUserLimits, assignWorkerLimits, buildUserUsage, getMailerAvailability, getUsageByRole } from "@/services/quota.service";
import { asyncHandler } from "@/utils/async-handler";
import { assignLimitsSchema, assignWorkerLimitsSchema, mailerTypeParamSchema } from "@/modules/usage/usage.schemas";

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

export const assignWorkerLimitsHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = assignWorkerLimitsSchema.parse({
    ...request.body,
    workerId: request.params.workerId ?? request.body.workerId,
  });
  response.json({ data: await assignWorkerLimits(payload) });
});

export const getMailerCardsHandler = asyncHandler(async (request: Request, response: Response) => {
  response.json({ data: (await buildUserUsage(request.auth!.userId)).mailerQuotas });
});

export const getOverviewHandler = asyncHandler(async (request: Request, response: Response) => {
  response.json({
    data: await getOverview({
      role: request.auth!.role as Role,
      userId: request.auth!.userId,
    }),
  });
});

export const getMailerAvailabilityHandler = asyncHandler(async (request: Request, response: Response) => {
  const { mailerType } = mailerTypeParamSchema.parse(request.params);
  response.json({ data: await getMailerAvailability({ mailerType, userId: request.auth!.userId }) });
});


