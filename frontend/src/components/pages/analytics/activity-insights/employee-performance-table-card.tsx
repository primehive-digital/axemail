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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const employeePerformance = [
  {
    firstName: "Ayesha",
    lastName: "Khan",
    email: "ayesha.khan@axemail.com",
    gmailSent: 260,
    gmailTarget: 320,
    domainSent: 180,
    domainTarget: 240,
    maskSent: 120,
    maskTarget: 160,
  },
  {
    firstName: "Hassan",
    lastName: "Raza",
    email: "hassan.raza@axemail.com",
    gmailSent: 310,
    gmailTarget: 360,
    domainSent: 220,
    domainTarget: 260,
    maskSent: 140,
    maskTarget: 180,
  },
  {
    firstName: "Mariam",
    lastName: "Siddiqui",
    email: "mariam.siddiqui@axemail.com",
    gmailSent: 190,
    gmailTarget: 240,
    domainSent: 150,
    domainTarget: 210,
    maskSent: 90,
    maskTarget: 130,
  },
  {
    firstName: "Usman",
    lastName: "Ali",
    email: "usman.ali@axemail.com",
    gmailSent: 230,
    gmailTarget: 280,
    domainSent: 160,
    domainTarget: 220,
    maskSent: 110,
    maskTarget: 150,
  },
  {
    firstName: "Sana",
    lastName: "Ahmed",
    email: "sana.ahmed@axemail.com",
    gmailSent: 210,
    gmailTarget: 260,
    domainSent: 175,
    domainTarget: 220,
    maskSent: 95,
    maskTarget: 140,
  },
  {
    firstName: "Bilal",
    lastName: "Sheikh",
    email: "bilal.sheikh@axemail.com",
    gmailSent: 285,
    gmailTarget: 330,
    domainSent: 205,
    domainTarget: 250,
    maskSent: 135,
    maskTarget: 170,
  },
];

const rowsPerPage = 5;

function RatioValue({
  sent,
  target,
  className,
}: {
  sent: number;
  target: number;
  className?: string;
}) {
  return (
    <span className={cn("digits text-lg font-medium text-heading", className)}>
      {sent.toLocaleString()}
      <span className="mx-1 text-sm font-medium text-muted-foreground">/</span>
      <span className="text-sm font-medium text-muted-foreground">
        {target.toLocaleString()}
      </span>
    </span>
  );
}

function formatDateRange(dateRange: DateRange | undefined) {
  if (!dateRange?.from) {
    return "Select date range";
  }

  if (!dateRange.to) {
    return format(dateRange.from, "MMM d, yyyy");
  }

  return `${format(dateRange.from, "MMM d, yyyy")} - ${format(
    dateRange.to,
    "MMM d, yyyy",
  )}`;
}

export function EmployeePerformanceTableCard() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 4, 10),
    to: new Date(2026, 4, 15),
  });
  const pageCount = Math.ceil(employeePerformance.length / rowsPerPage);
  const visiblePerformance = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return employeePerformance.slice(start, start + rowsPerPage);
  }, [page]);

  return (
    <Card className="gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b-2 px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">
              Employee Performance
            </h2>
            <p className="font-inter text-sm text-muted-foreground">
              Analyze employee sending performance for a selected date range.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 min-w-62 justify-start rounded-full px-4 font-google-sans shadow-sm shadow-[#f2f4f5]/10 transition-all duration-200 ease-in-out hover:bg-secondary hover:shadow-md hover:shadow-black/20"
                >
                  <CalendarDays className="size-4" />
                  <span className="truncate">{formatDateRange(dateRange)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
                  <Download className="size-4" />
                  Download report
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-inter">
                  <FileSpreadsheet className="size-4" />
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem className="font-inter">
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
              <tr className="border-b-2 border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Employee
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Target
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sent
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sent (%)
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gmail
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Domain
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mask
                </th>
              </tr>
            </thead>
            <tbody>
              {visiblePerformance.map((employee) => {
                const fullName = `${employee.firstName} ${employee.lastName}`;
                const totalSent =
                  employee.gmailSent + employee.domainSent + employee.maskSent;
                const totalTarget =
                  employee.gmailTarget +
                  employee.domainTarget +
                  employee.maskTarget;
                const sentPercentage =
                  totalTarget > 0
                    ? Math.min(Math.round((totalSent / totalTarget) * 100), 100)
                    : 0;

                return (
                  <tr
                    key={employee.email}
                    className="border-b-2 border-border transition-colors last:border-b-0 hover:bg-secondary/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-border bg-secondary text-heading">
                          <UserRound className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm font-medium leading-tight text-heading">
                            {fullName}
                          </span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">
                            {employee.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="digits text-lg font-medium text-heading">
                        {totalTarget.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="digits text-lg font-medium text-heading">
                        {totalSent.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="digits text-lg font-semibold text-blue-600">
                        {sentPercentage}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <RatioValue
                        sent={employee.gmailSent}
                        target={employee.gmailTarget}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <RatioValue
                        sent={employee.domainSent}
                        target={employee.domainTarget}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <RatioValue
                        sent={employee.maskSent}
                        target={employee.maskTarget}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t-2 border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page === 1}
              className="border-none bg-transparent"
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "size-8 rounded-sm p-0",
                    pageNumber === page
                      ? "bg-black hover:bg-black/80"
                      : "bg-transparent",
                  )}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={page === pageCount}
              className="border-none bg-transparent"
              onClick={() => setPage((value) => Math.min(value + 1, pageCount))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
