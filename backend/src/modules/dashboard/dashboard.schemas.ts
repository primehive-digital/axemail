import { z } from "zod";

import { toPrismaMailerType } from "@/utils/enum-mappers";

export const dashboardMailerTypeParamSchema = z.object({
  mailerType: z.enum(["gmail", "domain", "mask"]).transform(toPrismaMailerType),
});

export const templateSenderQuerySchema = z.object({
  mailerType: z.enum(["gmail", "domain", "mask"]).default("gmail").transform(toPrismaMailerType),
});
