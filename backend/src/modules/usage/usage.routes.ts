import { Role } from "@prisma/client";
import { Router } from "express";

import {
  assignLimitsHandler,
  getOverviewHandler,
  getMailerAvailabilityHandler,
  getMailerCardsHandler,
  getUsageHandler,
} from "@/modules/usage/usage.controller";
import { requireAuthenticatedUser, requireRoles } from "@/middleware/auth";

export const usageRouter = Router();

usageRouter.get("/usage", requireAuthenticatedUser, getUsageHandler);
usageRouter.post("/limits/assign", requireRoles(Role.ADMIN, Role.MANAGER), assignLimitsHandler);
usageRouter.patch("/limits/:userId", requireRoles(Role.ADMIN, Role.MANAGER), assignLimitsHandler);
usageRouter.get("/mailer-cards", requireRoles(Role.EMPLOYEE), getMailerCardsHandler);
usageRouter.get("/overview", requireAuthenticatedUser, getOverviewHandler);
usageRouter.get("/mailer-availability/:mailerType", requireRoles(Role.EMPLOYEE), getMailerAvailabilityHandler);
