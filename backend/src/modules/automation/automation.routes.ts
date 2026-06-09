import { Role } from "@prisma/client";
import { Router } from "express";

import {
  createAutomationLeadsHandler,
  createAutomationWorkerHandler,
  getAutomationDashboardHandler,
  processAutomationWorkerHandler,
  updateAutomationLeadHandler,
  updateAutomationWorkerHandler,
} from "@/modules/automation/automation.controller";
import { requireAuthenticatedUser, requireRoles } from "@/middleware/auth";

export const automationRouter = Router();

automationRouter.get("/automation/dashboard", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), getAutomationDashboardHandler);
automationRouter.post("/automation/workers", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), createAutomationWorkerHandler);
automationRouter.patch("/automation/workers/:workerId", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), updateAutomationWorkerHandler);
automationRouter.post("/automation/leads", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), createAutomationLeadsHandler);
automationRouter.patch("/automation/leads/:leadId", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), updateAutomationLeadHandler);
automationRouter.post("/automation/workers/:workerId/process", requireAuthenticatedUser, requireRoles(Role.ADMIN, Role.MANAGER), processAutomationWorkerHandler);
