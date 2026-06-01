"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AllocationLimitDialog } from "@/components/pages/administration/allocation-management/allocation-limit-dialog";
import { cn } from "@/lib/utils";

const userAllocations = [
  {
    firstName: "Ayesha",
    lastName: "Khan",
    email: "ayesha.khan@axemail.com",
    gmail: 25,
    domain: 18,
    mask: 12,
  },
  {
    firstName: "Hassan",
    lastName: "Raza",
    email: "hassan.raza@axemail.com",
    gmail: 30,
    domain: 20,
    mask: 10,
  },
  {
    firstName: "Mariam",
    lastName: "Siddiqui",
    email: "mariam.siddiqui@axemail.com",
    gmail: 15,
    domain: 12,
    mask: 8,
  },
  {
    firstName: "Usman",
    lastName: "Ali",
    email: "usman.ali@axemail.com",
    gmail: 20,
    domain: 16,
    mask: 10,
  },
  {
    firstName: "Sana",
    lastName: "Ahmed",
    email: "sana.ahmed@axemail.com",
    gmail: 18,
    domain: 14,
    mask: 9,
  },
  {
    firstName: "Bilal",
    lastName: "Sheikh",
    email: "bilal.sheikh@axemail.com",
    gmail: 22,
    domain: 15,
    mask: 11,
  },
];

const rowsPerPage = 5;

export function AllocationTableCard() {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(userAllocations.length / rowsPerPage);
  const visibleAllocations = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return userAllocations.slice(start, start + rowsPerPage);
  }, [page]);

  return (
    <Card className="gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b-2 px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">
              Allocation Table
            </h2>
            <p className="font-inter text-sm text-muted-foreground">
              Review assigned daily mailer limits to users.
            </p>
          </div>

          <AllocationLimitDialog />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-215 border-collapse">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  User
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gmail Allocation
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Domain Allocation
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mask Allocation
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total Allocation
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleAllocations.map((user) => {
                const total = user.gmail + user.domain + user.mask;

                return (
                  <tr
                    key={user.email}
                    className="border-b-2 border-border transition-colors last:border-b-0 hover:bg-secondary/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                          <UserRound className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm leading-tight font-medium text-heading">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="digits text-lg font-medium">
                        {user.gmail}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="digits text-lg font-medium">
                        {user.domain}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="digits text-lg font-medium">
                        {user.mask}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="digits text-lg font-semibold text-blue-600">
                        {total}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 border-t-2 border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page === 1}
              className="bg-transparent border-none"
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              <ChevronLeft className="size-4" strokeWidth={3} />
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
              className="bg-transparent border-none"
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
