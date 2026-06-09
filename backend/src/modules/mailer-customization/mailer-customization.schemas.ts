import { z } from "zod";

import { toPrismaMailerType } from "@/utils/enum-mappers";

export const mailerCustomizationMailerTypeSchema = z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType);

export const mailerCustomizationMailerParamSchema = z.object({
  mailerType: mailerCustomizationMailerTypeSchema,
});

export const replyToOptionIdParamSchema = z.object({
  optionId: z.string().trim().min(1),
});

export const createReplyToOptionSchema = z.object({
  mailerType: mailerCustomizationMailerTypeSchema,
  label: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(180),
});

export const updateReplyToOptionSchema = z.object({
  label: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(180),
});

export const updateCooldownScheduleSchema = z.object({
  schedule: z.array(z.number().int().min(1).max(3600)).min(1).max(12),
});

