import { Router } from "express";

import {
  assignLimitsHandler,
  getOverviewHandler,
  getSenderAvailabilityHandler,
  getSenderCardsHandler,
  getUsageHandler,
} from "@/modules/usage/usage.controller";
import { requireAuthenticatedUser, requireRoles } from "@/middleware/auth";

export const usageRouter = Router();

usageRouter.get("/usage", requireAuthenticatedUser, getUsageHandler);
usageRouter.post("/limits/assign", requireRoles("ADMIN", "MANAGER"), assignLimitsHandler);
usageRouter.patch("/limits/:userId", requireRoles("ADMIN", "MANAGER"), assignLimitsHandler);
usageRouter.get("/sender-cards", requireRoles("EMPLOYEE"), getSenderCardsHandler);
usageRouter.get("/overview", requireAuthenticatedUser, getOverviewHandler);
usageRouter.get("/sender-availability/:senderType", requireRoles("EMPLOYEE"), getSenderAvailabilityHandler);
