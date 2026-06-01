import { Role } from "@prisma/client";
import { Router } from "express";

import {
  createSmtpMailerAccountHandler,
  deleteSmtpMailerAccountHandler,
  getMaskServerHealthHandler,
  getSmtpMailerAccountMetricsHandler,
  getSmtpMailerAccountsHandler,
  getMailerPoliciesHandler,
  testSmtpMailerAccountHandler,
  updateMailerPolicyHandler,
  updateSmtpMailerAccountHandler,
} from "@/modules/smtp-mailer-accounts/smtp-mailer-accounts.controller";
import { requireAuthenticatedUser, requireRoles } from "@/middleware/auth";

export const smtpMailerAccountsRouter = Router();

smtpMailerAccountsRouter.get("/smtp-mailer-account-metrics", requireAuthenticatedUser, requireRoles(Role.ADMIN), getSmtpMailerAccountMetricsHandler);
smtpMailerAccountsRouter.get("/smtp-mailer-accounts", requireAuthenticatedUser, requireRoles(Role.ADMIN), getSmtpMailerAccountsHandler);
smtpMailerAccountsRouter.get("/mailer-policies", requireAuthenticatedUser, requireRoles(Role.ADMIN), getMailerPoliciesHandler);
smtpMailerAccountsRouter.post("/smtp-mailer-accounts", requireAuthenticatedUser, requireRoles(Role.ADMIN), createSmtpMailerAccountHandler);
smtpMailerAccountsRouter.patch("/smtp-mailer-accounts/:smtpMailerAccountId", requireAuthenticatedUser, requireRoles(Role.ADMIN), updateSmtpMailerAccountHandler);
smtpMailerAccountsRouter.delete("/smtp-mailer-accounts/:smtpMailerAccountId", requireAuthenticatedUser, requireRoles(Role.ADMIN), deleteSmtpMailerAccountHandler);
smtpMailerAccountsRouter.post("/smtp-mailer-accounts/:smtpMailerAccountId/test", requireAuthenticatedUser, requireRoles(Role.ADMIN), testSmtpMailerAccountHandler);
smtpMailerAccountsRouter.put("/mailer-policies/:mailerType", requireAuthenticatedUser, requireRoles(Role.ADMIN), updateMailerPolicyHandler);
smtpMailerAccountsRouter.get("/mask-server/health", requireAuthenticatedUser, requireRoles(Role.ADMIN), getMaskServerHealthHandler);
