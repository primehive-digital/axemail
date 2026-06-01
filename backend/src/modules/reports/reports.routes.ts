import { Router } from "express";

import { exportPerformanceReportHandler, getPerformanceReportHandler } from "@/modules/reports/reports.controller";
import { requireRoles } from "@/middleware/auth";

export const reportsRouter = Router();

reportsRouter.get("/reports/employee-performance", requireRoles("ADMIN", "MANAGER"), getPerformanceReportHandler);
reportsRouter.get("/reports/employee-performance/export", requireRoles("ADMIN", "MANAGER"), exportPerformanceReportHandler);
