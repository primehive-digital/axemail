import { z } from "zod";

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;

export const performanceReportQuerySchema = z.object({
  month: z.string().regex(monthPattern).optional(),
  startDate: z.string().regex(datePattern).optional(),
  endDate: z.string().regex(datePattern).optional(),
});

export const performanceReportExportQuerySchema = performanceReportQuerySchema.extend({
  format: z.enum(["excel", "pdf"]),
});
