import type { Request, Response } from "express";

import {
  getActivityInsightsDashboard,
  getAllocationManagementDashboard,
  getDashboardMailerStatus,
  getDashboardOverview,
  getInfrastructureControlDashboard,
  getResourceUsageDashboard,  getUserManagementDashboard,
} from "@/services/dashboard.service";
import {
  dashboardMailerTypeParamSchema,
  dashboardReportQuerySchema,} from "@/modules/dashboard/dashboard.schemas";
import { asyncHandler } from "@/utils/async-handler";

export const getDashboardOverviewHandler = asyncHandler(async (request: Request, response: Response) => {
  response.json({ data: await getDashboardOverview({ role: request.auth!.role, userId: request.auth!.userId }) });
});

export const getDashboardMailerStatusHandler = asyncHandler(async (request: Request, response: Response) => {
  const { mailerType } = dashboardMailerTypeParamSchema.parse(request.params);
  response.json({
    data: await getDashboardMailerStatus({
      role: request.auth!.role,
      userId: request.auth!.userId,
      mailerType,
    }),
  });
});

export const getResourceUsageDashboardHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await getResourceUsageDashboard() });
});

export const getActivityInsightsDashboardHandler = asyncHandler(async (request: Request, response: Response) => {
  const query = dashboardReportQuerySchema.parse(request.query);
  response.json({ data: await getActivityInsightsDashboard({ ...query, role: request.auth!.role, userId: request.auth!.userId }) });
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