import type { Request, Response } from "express";

import { performanceReportExportQuerySchema, performanceReportQuerySchema } from "@/modules/reports/reports.schemas";
import { buildPerformanceReportExcel, buildPerformanceReportPdf } from "@/services/report-export.service";
import { getPerformanceReport } from "@/services/performance-report.service";
import { asyncHandler } from "@/utils/async-handler";

export const getPerformanceReportHandler = asyncHandler(async (request: Request, response: Response) => {
  const query = performanceReportQuerySchema.parse(request.query);
  response.json({
    data: await getPerformanceReport({
      role: request.auth!.role,
      userId: request.auth!.userId,
      month: query.month,
      startDate: query.startDate,
      endDate: query.endDate,
    }),
  });
});

export const exportPerformanceReportHandler = asyncHandler(async (request: Request, response: Response) => {
  const query = performanceReportExportQuerySchema.parse(request.query);
  const report = await getPerformanceReport({
    role: request.auth!.role,
    userId: request.auth!.userId,
    month: query.month,
    startDate: query.startDate,
    endDate: query.endDate,
  });
  const filenameRange = `${report.range.start.slice(0, 10)}-${report.range.endExclusive.slice(0, 10)}`;

  if (query.format === "excel") {
    response
      .setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8")
      .setHeader("Content-Disposition", `attachment; filename="employee-performance-${filenameRange}.xls"`)
      .send(buildPerformanceReportExcel(report));
    return;
  }

  response
    .setHeader("Content-Type", "application/pdf")
    .setHeader("Content-Disposition", `attachment; filename="employee-performance-${filenameRange}.pdf"`)
    .send(buildPerformanceReportPdf(report));
});
