import { z } from "zod";

import { toPrismaMailerType } from "@/utils/enum-mappers";

export const dashboardMailerTypeParamSchema = z.object({
  mailerType: z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType),
});

export const dashboardReportQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
  startDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/).optional(),
});

export const templateSenderQuerySchema = z.object({
  mailerType: z.enum(["gmail", "domain", "mask"]).default("gmail").transform(toPrismaMailerType),
});