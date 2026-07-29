import { Router } from "express";

import { exportPerformanceReportHandler, getPerformanceReportHandler } from "@/modules/reports/reports.controller";
import { requireAuthenticatedUser } from "@/middleware/auth";

export const reportsRouter = Router();

reportsRouter.get("/reports/employee-performance", requireAuthenticatedUser, getPerformanceReportHandler);
reportsRouter.get("/reports/employee-performance/export", requireAuthenticatedUser, exportPerformanceReportHandler);
