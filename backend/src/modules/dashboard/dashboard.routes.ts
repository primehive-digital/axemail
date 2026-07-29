import { Role } from "@prisma/client";
import { Router } from "express";

import {
  getAllocationManagementDashboardHandler,
  getDashboardMailerStatusHandler,
  getInfrastructureControlDashboardHandler,
  getUsageLimitsDashboardHandler,
  getUserManagementDashboardHandler,
} from "@/modules/dashboard/dashboard.controller";
import { requireAuthenticatedUser, requireRoles } from "@/middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard/outreach/:mailerType", requireRoles(Role.EMPLOYEE), getDashboardMailerStatusHandler);
dashboardRouter.get("/dashboard/usage-limits", requireRoles(Role.ADMIN), getUsageLimitsDashboardHandler);
dashboardRouter.get("/dashboard/user-management", requireRoles(Role.ADMIN, Role.MANAGER), getUserManagementDashboardHandler);
dashboardRouter.get("/dashboard/allocation-management", requireRoles(Role.ADMIN, Role.MANAGER), getAllocationManagementDashboardHandler);
dashboardRouter.get("/dashboard/infrastructure-control", requireRoles(Role.ADMIN), getInfrastructureControlDashboardHandler);
