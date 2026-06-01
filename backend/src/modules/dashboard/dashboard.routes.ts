import { Role } from "@prisma/client";
import { Router } from "express";

import {
  getActivityInsightsDashboardHandler,
  getAllocationManagementDashboardHandler,
  getDashboardMailerStatusHandler,
  getDashboardOverviewHandler,
  getInfrastructureControlDashboardHandler,
  getResourceUsageDashboardHandler,
  getTemplateSenderDashboardHandler,
  getUserManagementDashboardHandler,
} from "@/modules/dashboard/dashboard.controller";
import { requireAuthenticatedUser, requireRoles } from "@/middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard/overview", requireAuthenticatedUser, getDashboardOverviewHandler);
dashboardRouter.get("/dashboard/outreach/:mailerType", requireRoles(Role.EMPLOYEE), getDashboardMailerStatusHandler);
dashboardRouter.get("/dashboard/template-sender", requireRoles(Role.EMPLOYEE), getTemplateSenderDashboardHandler);
dashboardRouter.get("/dashboard/resource-usage", requireRoles(Role.ADMIN, Role.MANAGER), getResourceUsageDashboardHandler);
dashboardRouter.get("/dashboard/activity-insights", requireRoles(Role.ADMIN, Role.MANAGER), getActivityInsightsDashboardHandler);
dashboardRouter.get("/dashboard/user-management", requireRoles(Role.ADMIN, Role.MANAGER), getUserManagementDashboardHandler);
dashboardRouter.get("/dashboard/allocation-management", requireRoles(Role.ADMIN, Role.MANAGER), getAllocationManagementDashboardHandler);
dashboardRouter.get("/dashboard/infrastructure-control", requireRoles(Role.ADMIN), getInfrastructureControlDashboardHandler);