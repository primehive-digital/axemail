import { z } from "zod";

import {
  toPrismaMailerType,
  toPrismaSmtpMailerAccountStatus,
  toPrismaSmtpMailerHealth,
} from "@/utils/enum-mappers";

const smtpMailerTypeSchema = z.enum(["gmail", "domain"]).transform(toPrismaMailerType);
const mailerPolicyTypeSchema = z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType);
const smtpMailerAccountStatusSchema = z.enum(["active", "paused", "archived"]).transform(toPrismaSmtpMailerAccountStatus);
const smtpMailerHealthSchema = z.enum(["active", "burned", "banned", "not_working"]).transform(toPrismaSmtpMailerHealth);

export const smtpMailerAccountIdSchema = z.object({
  smtpMailerAccountId: z.string().min(1),
});

export const mailerPolicyTypeParamSchema = z.object({
  mailerType: mailerPolicyTypeSchema,
});

export const createSmtpMailerAccountSchema = z.object({
  type: smtpMailerTypeSchema,
  label: z.string().trim().min(1),
  email: z.email().toLowerCase(),
  status: smtpMailerAccountStatusSchema.optional(),
  healthStatus: smtpMailerHealthSchema.optional(),
  password: z.string().min(1).optional(),
  appPassword: z.string().min(1).optional(),
});

export const updateSmtpMailerAccountSchema = z.object({
  label: z.string().trim().min(1).optional(),
  email: z.email().toLowerCase().optional(),
  status: smtpMailerAccountStatusSchema.optional(),
  healthStatus: smtpMailerHealthSchema.optional(),
  password: z.string().min(1).optional(),
  appPassword: z.string().min(1).optional(),
});

export const mailerPolicySchema = z.object({
  dailyLimit: z.coerce.number().int().positive(),
});