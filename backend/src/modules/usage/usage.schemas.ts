import { z } from "zod";

import { toPrismaMailerType } from "@/utils/enum-mappers";

export const assignLimitsSchema = z.object({
  userId: z.string().min(1),
  gmail: z.coerce.number().int().min(0),
  domain: z.coerce.number().int().min(0),
  mask: z.coerce.number().int().min(0),
});

export const assignWorkerLimitsSchema = z.object({
  workerId: z.string().min(1),
  gmail: z.coerce.number().int().min(0),
  domain: z.coerce.number().int().min(0),
  mask: z.coerce.number().int().min(0),
});

export const mailerTypeParamSchema = z.object({
  mailerType: z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType),
});
