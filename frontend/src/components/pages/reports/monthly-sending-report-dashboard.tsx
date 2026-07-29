"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  ProfessionalTableEmpty,
  ProfessionalTablePagination,
  ProfessionalTableViewport,
  tableCellClassName,
  tableClassName,
  tableHeaderCellClassName,
  tableHeaderRowClassName,
  tableRowClassName,
  useTablePagination,
} from "@/components/shared/professional-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { downloadMonthlySendingReport, getMonthlySendingReport } from "@/lib/monthly-report/monthly-report-api";
import { cn } from "@/lib/utils";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function MonthlySendingReportDashboard() {
  const [month, setMonth] = useState(currentMonth);
  const query = useQuery({ queryKey: ["monthly-sending-report", month], queryFn: () => getMonthlySendingReport(month) });
  const downloadMutation = useMutation({
    mutationFn: (format: "excel" | "pdf") => downloadMonthlySendingReport(month, format),
    onSuccess: () => toast.success("Monthly report download started."),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to download report."),
  });
  const summary = query.data?.summary;
  const employees = query.data?.employees ?? [];
  const pagination = useTablePagination(employees);

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Monthly Sending Report</h1>
          <p className="mt-1 font-inter text-sm text-muted-foreground">See exactly how many Gmail, domain, and mask emails each employee sent.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input aria-label="Report month" type="month" value={month} max={currentMonth()} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm" />
          <Button variant="outline" className="rounded-md" onClick={() => downloadMutation.mutate("excel")} disabled={downloadMutation.isPending}><Download className="size-4" />Excel</Button>
          <Button variant="outline" className="rounded-md" onClick={() => downloadMutation.mutate("pdf")} disabled={downloadMutation.isPending}><Download className="size-4" />PDF</Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Employees", summary?.totalEmployees ?? 0],
          ["Sent", summary?.totalSent ?? 0],
          ["Failed", summary?.totalFailed ?? 0],
          ["Queued", summary?.totalQueued ?? 0],
        ].map(([label, value]) => <Card key={label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="digits mt-2 text-3xl font-semibold">{Number(value).toLocaleString()}</p></CardContent></Card>)}
      </section>

      <Card className="gap-0 overflow-hidden rounded-xl border border-border py-0 shadow-sm">
        <CardHeader className="border-b px-5 py-5">
          <h2 className="font-google-sans text-xl font-semibold text-heading">{query.data?.monthLabel ?? month}</h2>
          <p className="font-inter text-sm text-muted-foreground">Employee delivery totals and completion against monthly targets.</p>
        </CardHeader>
        <CardContent className="p-0">
          <ProfessionalTableViewport>
            <table className={cn(tableClassName, "min-w-280")}>
              <thead><tr className={tableHeaderRowClassName}>
                {["Employee", "Target", "Total Sent", "Gmail", "Domain", "Mask", "Failed", "Completion"].map((heading) => (
                  <th key={heading} className={tableHeaderCellClassName}>{heading}</th>
                ))}
              </tr></thead>
              <tbody>
                {query.isLoading ? (
                  <ProfessionalTableEmpty colSpan={8} message="Loading monthly report" isLoading />
                ) : pagination.visibleRows.length === 0 ? (
                  <ProfessionalTableEmpty colSpan={8} message="No employee delivery records found for this month." />
                ) : pagination.visibleRows.map((employee) => (
                  <tr key={employee.userId} className={tableRowClassName}>
                    <td className={tableCellClassName}><strong className="block font-google-sans text-sm">{employee.name}</strong><small className="text-muted-foreground">{employee.email}</small></td>
                    <td className={`${tableCellClassName} digits`}>{employee.monthTarget.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits font-semibold`}>{employee.totalSent.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits`}>{employee.mailerTotals.gmail.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits`}>{employee.mailerTotals.domain.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits`}>{employee.mailerTotals.mask.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits`}>{employee.totalFailed.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits font-semibold text-blue-700`}>{employee.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ProfessionalTableViewport>
          <ProfessionalTablePagination
            page={pagination.activePage}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
