import type { Request, Response } from "express";

import { getMaskServerHealth } from "@/services/mask-server.service";
import { listMailerPolicies, updateMailerPolicy } from "@/services/mailer-policy.service";
import {
  createSmtpMailerAccount,
  deleteSmtpMailerAccount,
  getSmtpMailerAccountMetrics,
  listSmtpMailerAccounts,
  testSmtpMailerAccount,
  updateSmtpMailerAccount,
} from "@/services/smtp-mailer-account.service";
import {
  createSmtpMailerAccountSchema,
  mailerPolicySchema,
  mailerPolicyTypeParamSchema,
  smtpMailerAccountIdSchema,
  updateSmtpMailerAccountSchema,
} from "@/modules/smtp-mailer-accounts/smtp-mailer-accounts.schemas";
import { asyncHandler } from "@/utils/async-handler";

export const getSmtpMailerAccountsHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await listSmtpMailerAccounts() });
});

export const getSmtpMailerAccountMetricsHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await getSmtpMailerAccountMetrics() });
});

export const getMailerPoliciesHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await listMailerPolicies() });
});

export const createSmtpMailerAccountHandler = asyncHandler(async (request: Request, response: Response) => {
  const payload = createSmtpMailerAccountSchema.parse(request.body);
  response.status(201).json({ data: await createSmtpMailerAccount(payload) });
});

export const updateSmtpMailerAccountHandler = asyncHandler(async (request: Request, response: Response) => {
  const { smtpMailerAccountId } = smtpMailerAccountIdSchema.parse(request.params);
  const payload = updateSmtpMailerAccountSchema.parse(request.body);
  response.json({ data: await updateSmtpMailerAccount(smtpMailerAccountId, payload) });
});

export const deleteSmtpMailerAccountHandler = asyncHandler(async (request: Request, response: Response) => {
  const { smtpMailerAccountId } = smtpMailerAccountIdSchema.parse(request.params);
  response.json({ data: await deleteSmtpMailerAccount(smtpMailerAccountId) });
});

export const updateMailerPolicyHandler = asyncHandler(async (request: Request, response: Response) => {
  const { mailerType } = mailerPolicyTypeParamSchema.parse(request.params);
  const payload = mailerPolicySchema.parse(request.body);
  response.json({ data: await updateMailerPolicy(mailerType, payload.dailyLimit) });
});

export const testSmtpMailerAccountHandler = asyncHandler(async (request: Request, response: Response) => {
  const { smtpMailerAccountId } = smtpMailerAccountIdSchema.parse(request.params);
  response.json({ data: await testSmtpMailerAccount(smtpMailerAccountId) });
});

export const getMaskServerHealthHandler = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ data: await getMaskServerHealth() });
});