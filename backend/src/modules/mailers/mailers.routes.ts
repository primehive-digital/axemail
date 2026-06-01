import { Role } from "@prisma/client";
import { Router } from "express";

import {
  sendDomainHandler,
  sendGmailHandler,
  sendMaskHandler,
} from "@/modules/mailers/mailers.controller";
import { requireRoles } from "@/middleware/auth";

export const mailersRouter = Router();

mailersRouter.post("/gmail-mailer/send", requireRoles(Role.EMPLOYEE), sendGmailHandler);
mailersRouter.post("/domain-mailer/send", requireRoles(Role.EMPLOYEE), sendDomainHandler);
mailersRouter.post("/mask-mailer/send", requireRoles(Role.EMPLOYEE), sendMaskHandler);
