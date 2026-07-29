"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { downloadMonthlySendingReport, getMonthlySendingReport } from "@/lib/monthly-report/monthly-report-api";

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

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Monthly Sending Report</h1>
          <p className="mt-1 font-inter text-sm text-muted-foreground">See exactly how many Gmail, domain, and mask emails each employee sent.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input aria-label="Report month" type="month" value={month} max={currentMonth()} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm" />
          <Button variant="outline" onClick={() => downloadMutation.mutate("excel")} disabled={downloadMutation.isPending}><Download className="size-4" />Excel</Button>
          <Button variant="outline" onClick={() => downloadMutation.mutate("pdf")} disabled={downloadMutation.isPending}><Download className="size-4" />PDF</Button>
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

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b px-5 py-5"><h2 className="text-xl font-semibold">{query.data?.monthLabel ?? month}</h2></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-220 border-collapse">
            <thead><tr className="border-b bg-secondary/60">
              {['Employee','Target','Total Sent','Gmail','Domain','Mask','Failed','Completion'].map((heading) => <th key={heading} className="px-5 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{heading}</th>)}
            </tr></thead>
            <tbody>
              {query.isLoading ? <tr><td colSpan={8} className="px-5 py-16 text-center text-muted-foreground">Loading monthly report…</td></tr> :
                (query.data?.employees ?? []).map((employee) => (
                  <tr key={employee.userId} className="border-b last:border-0">
                    <td className="px-5 py-4"><strong className="block text-sm">{employee.name}</strong><small className="text-muted-foreground">{employee.email}</small></td>
                    <td className="px-5 py-4 digits">{employee.monthTarget.toLocaleString()}</td>
                    <td className="px-5 py-4 digits font-semibold">{employee.totalSent.toLocaleString()}</td>
                    <td className="px-5 py-4 digits">{employee.mailerTotals.gmail.toLocaleString()}</td>
                    <td className="px-5 py-4 digits">{employee.mailerTotals.domain.toLocaleString()}</td>
                    <td className="px-5 py-4 digits">{employee.mailerTotals.mask.toLocaleString()}</td>
                    <td className="px-5 py-4 digits">{employee.totalFailed.toLocaleString()}</td>
                    <td className="px-5 py-4 digits">{employee.completionRate}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
