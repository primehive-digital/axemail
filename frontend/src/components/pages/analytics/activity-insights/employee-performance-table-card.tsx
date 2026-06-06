"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  UserRound,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PerformanceReport, PerformanceReportEmployee } from "@/lib/activity-insights/activity-insights-api";

const rowsPerPage = 5;
const emptyEmployees: PerformanceReportEmployee[] = [];

function RatioValue({ sent, target, className }: { sent: number; target: number; className?: string }) {
  return (
    <span className={cn("digits text-lg font-medium text-heading", className)}>
      {sent.toLocaleString()}
      <span className="mx-1 text-sm font-medium text-muted-foreground">/</span>
      <span className="text-sm font-medium text-muted-foreground">{target.toLocaleString()}</span>
    </span>
  );
}

function formatInputDate(date: Date | undefined) {
  return date ? format(date, "MM/dd/yyyy") : "Select date";
}

function TableLoader() {
  return (
    <tr>
      <td colSpan={7} className="h-72 px-5 py-10 text-center">
        <div className="flex items-center justify-center gap-2 font-inter text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading performance data...
        </div>
      </td>
    </tr>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="h-72 px-5 py-10 text-center font-inter text-sm text-muted-foreground">
        No employee performance data is available for the selected date range.
      </td>
    </tr>
  );
}

function getMailerTarget(employee: PerformanceReportEmployee, mailer: "gmail" | "domain" | "mask", daysTracked: number) {
  return employee.mailerTargets[mailer] * daysTracked;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarMonthCount(start: Date, end: Date) {
  const monthCount = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
  return Math.min(Math.max(monthCount, 1), 2);
}


export function EmployeePerformanceTableCard({
  report,
  dateRange,
  isLoading,
  isDownloading,
  onDateRangeChange,
  onDownload,
}: {
  report: PerformanceReport | null;
  dateRange: DateRange | undefined;
  isLoading?: boolean;
  isDownloading?: boolean;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onDownload: (format: "excel" | "pdf") => void;
}) {
  const [page, setPage] = useState(1);
  const employees = report?.employees ?? emptyEmployees;
  const daysTracked = report?.range.daysTracked ?? 0;
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const availabilityStart = report ? parseDateKey(report.availability.start) : getMonthStart(new Date());
  const availabilityEnd = report ? parseDateKey(report.availability.end) : new Date();
  const startMonth = getMonthStart(availabilityStart);
  const endMonth = getMonthStart(availabilityEnd);
  const numberOfMonths = getCalendarMonthCount(startMonth, endMonth);
  const disabledDates = [{ before: availabilityStart }, { after: availabilityEnd }];
  const pageCount = Math.max(Math.ceil(employees.length / rowsPerPage), 1);
  const currentPage = Math.min(page, pageCount);
  const visiblePerformance = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return employees.slice(start, start + rowsPerPage);
  }, [currentPage, employees]);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Employee Performance</h2>
            <p className="font-inter text-sm text-muted-foreground">
              Analyze employee sending performance for a selected date range.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Popover open={dateRangePickerOpen} onOpenChange={setDateRangePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 min-w-82 justify-between rounded-full px-4 font-google-sans shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-secondary hover:shadow-md hover:shadow-black/20"
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <span className="truncate">{formatInputDate(dateRange?.from)}</span>
                    <span className="h-4 w-px bg-border" />
                    <span className="truncate">{formatInputDate(dateRange?.to)}</span>
                  </span>
                  <CalendarDays className="size-4 shrink-0 text-heading" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={onDateRangeChange}
                  numberOfMonths={numberOfMonths}
                  startMonth={startMonth}
                  endMonth={endMonth}
                  defaultMonth={dateRange?.from ?? availabilityEnd}
                  disabled={disabledDates}
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isDownloading || isLoading || employees.length === 0} className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
                  {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  Download report
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-inter" onSelect={() => onDownload("excel")}>
                  <FileSpreadsheet className="size-4" />
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem className="font-inter" onSelect={() => onDownload("pdf")}>
                  <FileText className="size-4" />
                  Download PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-250 border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Employee</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Target</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sent</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sent (%)</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gmail</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domain</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mask</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableLoader />
              ) : visiblePerformance.length === 0 ? (
                <EmptyRow />
              ) : (
                visiblePerformance.map((employee) => (
                  <tr key={employee.userId} className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                          <UserRound className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm font-medium leading-tight text-heading">{employee.name}</span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">{employee.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="digits text-lg font-medium text-heading">{employee.monthTarget.toLocaleString()}</span></td>
                    <td className="px-5 py-4"><span className="digits text-lg font-medium text-heading">{employee.totalSent.toLocaleString()}</span></td>
                    <td className="px-5 py-4"><span className="digits text-lg font-semibold text-blue-600">{employee.completionRate}%</span></td>
                    <td className="px-5 py-4"><RatioValue sent={employee.mailerTotals.gmail} target={getMailerTarget(employee, "gmail", daysTracked)} /></td>
                    <td className="px-5 py-4"><RatioValue sent={employee.mailerTotals.domain} target={getMailerTarget(employee, "domain", daysTracked)} /></td>
                    <td className="px-5 py-4"><RatioValue sent={employee.mailerTotals.mask} target={getMailerTarget(employee, "mask", daysTracked)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" disabled={currentPage === 1} className="border-none bg-transparent" onClick={() => setPage((value) => Math.max(value - 1, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Button key={pageNumber} type="button" variant={pageNumber === currentPage ? "default" : "outline"} size="sm" className={cn("size-8 rounded-sm p-0", pageNumber === currentPage ? "bg-black hover:bg-black/80" : "bg-transparent")} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </Button>
            ))}
            <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" disabled={currentPage === pageCount} className="border-none bg-transparent" onClick={() => setPage((value) => Math.min(value + 1, pageCount))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}