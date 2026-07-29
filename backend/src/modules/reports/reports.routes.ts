import { Role } from "@prisma/client";
import { Router } from "express";

import { exportPerformanceReportHandler, getPerformanceReportHandler } from "@/modules/reports/reports.controller";
import { requireRoles } from "@/middleware/auth";

export const reportsRouter = Router();

reportsRouter.get("/reports/employee-performance", requireRoles(Role.ADMIN, Role.MANAGER), getPerformanceReportHandler);
reportsRouter.get("/reports/employee-performance/export", requireRoles(Role.ADMIN, Role.MANAGER), exportPerformanceReportHandler);
