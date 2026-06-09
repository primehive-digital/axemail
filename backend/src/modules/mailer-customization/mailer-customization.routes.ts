import { Role } from "@prisma/client";
import { Router } from "express";

import {
  createReplyToOptionHandler,
  deleteReplyToOptionHandler,
  getMailerCustomizationDashboardHandler,
  updateMailerCooldownScheduleHandler,
  updateReplyToOptionHandler,
} from "@/modules/mailer-customization/mailer-customization.controller";
import { requireRoles } from "@/middleware/auth";

export const mailerCustomizationRouter = Router();

mailerCustomizationRouter.get("/mailer-customization", requireRoles(Role.ADMIN, Role.MANAGER), getMailerCustomizationDashboardHandler);
mailerCustomizationRouter.post("/mailer-customization/reply-to-options", requireRoles(Role.ADMIN, Role.MANAGER), createReplyToOptionHandler);
mailerCustomizationRouter.patch("/mailer-customization/reply-to-options/:optionId", requireRoles(Role.ADMIN, Role.MANAGER), updateReplyToOptionHandler);
mailerCustomizationRouter.delete("/mailer-customization/reply-to-options/:optionId", requireRoles(Role.ADMIN, Role.MANAGER), deleteReplyToOptionHandler);
mailerCustomizationRouter.patch("/mailer-customization/:mailerType/cooldown", requireRoles(Role.ADMIN, Role.MANAGER), updateMailerCooldownScheduleHandler);

