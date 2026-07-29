import type { Request, Response } from "express";

import {
  getAllocationManagementDashboard,
  getDashboardMailerStatus,
  getInfrastructureControlDashboard,
  getUsageLimitsDashboard,
  getUserManagementDashboard,
} from "@/services/dashboard.service";
import {
  dashboardMailerTypeParamSchema,
} from "@/modules/dashboard/dashboard.schemas";
import { asyncHandler } from "@/utils/async-handler";

export const getDashboardMailerStatusHandler = asyncHandler(async (request: Request, response: Response) => {
  const { mailerType } = dashboardMailerTypeParamSchema.parse(request.params);
  response.json({
    data: await getDashboardMailerStatus({
      userId: request.auth!.userId,
      mailerType,
    }),
  });
});

export const getUsageLimitsDashboardHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await getUsageLimitsDashboard() });
});

export const getUserManagementDashboardHandler = asyncHandler(async (request: Request, response: Response) => {
  response.json({ data: await getUserManagementDashboard(request.auth!.role) });
});

export const getAllocationManagementDashboardHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await getAllocationManagementDashboard() });
});

export const getInfrastructureControlDashboardHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await getInfrastructureControlDashboard() });
});
