import { Role } from "@prisma/client";
import { Router } from "express";

import {
  createTemplateHandler,
  deleteTemplateHandler,
  getTemplateSenderDashboardHandler,
  listTemplatesHandler,
  sendTemplateHandler,
  updateTemplateHandler,
} from "@/modules/templates/templates.controller";
import { requireRoles } from "@/middleware/auth";

export const templatesRouter = Router();

templatesRouter.get("/templates", requireRoles(Role.ADMIN, Role.MANAGER), listTemplatesHandler);
templatesRouter.post("/templates", requireRoles(Role.ADMIN, Role.MANAGER), createTemplateHandler);
templatesRouter.patch("/templates/:templateId", requireRoles(Role.ADMIN, Role.MANAGER), updateTemplateHandler);
templatesRouter.delete("/templates/:templateId", requireRoles(Role.ADMIN, Role.MANAGER), deleteTemplateHandler);
templatesRouter.get("/dashboard/template-sender", requireRoles(Role.EMPLOYEE), getTemplateSenderDashboardHandler);
templatesRouter.post("/templates/send", requireRoles(Role.EMPLOYEE), sendTemplateHandler);