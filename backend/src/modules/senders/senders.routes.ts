import { Router } from "express";

import {
  sendDomainHandler,
  sendGmailHandler,
  sendMaskHandler,
} from "@/modules/senders/senders.controller";
import { requireRoles } from "@/middleware/auth";

export const sendersRouter = Router();

sendersRouter.post("/gmail-sender/send", requireRoles("EMPLOYEE"), sendGmailHandler);
sendersRouter.post("/domain-sender/send", requireRoles("EMPLOYEE"), sendDomainHandler);
sendersRouter.post("/mask-sender/send", requireRoles("EMPLOYEE"), sendMaskHandler);
