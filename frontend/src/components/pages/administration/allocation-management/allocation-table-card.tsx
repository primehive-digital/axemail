"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AllocationLimitDialog } from "@/components/pages/administration/allocation-management/allocation-limit-dialog";
import type { AllocationPool, AllocationRow, AllocationUser, AssignAllocationPayload } from "@/lib/allocation-management/allocation-management-api";
import { cn } from "@/lib/utils";

const rowsPerPage = 5;

function EmptyRows({ message, isLoading }: { message: string; isLoading?: boolean }) {
  return (
    <tr>
      <td colSpan={5} className="px-5 py-16 text-center font-inter text-sm text-muted-foreground">
        <span className="inline-flex items-center justify-center gap-2">
          {isLoading && <LoaderCircle className="size-5 animate-spin text-primary" />}
          <span>{message}</span>
        </span>
      </td>
    </tr>
  );
}

export function AllocationTableCard({
  pools,
  rows,
  users,
  isLoading,
  onAssignAllocation,
  isAssigning,
}: {
  pools: AllocationPool[];
  rows: AllocationRow[];
  users: AllocationUser[];
  isLoading?: boolean;
  onAssignAllocation: (input: AssignAllocationPayload) => Promise<unknown> | void;
  isAssigning?: boolean;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(Math.ceil(rows.length / rowsPerPage), 1);
  const activePage = Math.min(page, pageCount);
  const visibleAllocations = useMemo(() => {
    const start = (activePage - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [activePage, rows]);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Allocation Table</h2>
            <p className="font-inter text-sm text-muted-foreground">Review assigned daily mailer limits to employees.</p>
          </div>

          <AllocationLimitDialog pools={pools} users={users} rows={rows} onSubmit={onAssignAllocation} isPending={isAssigning} />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-215 border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gmail Allocation</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domain Allocation</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mask Allocation</th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Allocation</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <EmptyRows message="Loading allocations" isLoading />
              ) : visibleAllocations.length === 0 ? (
                <EmptyRows message="No employee allocations found." />
              ) : (
                visibleAllocations.map((row) => (
                  <tr key={row.user.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                          <UserRound className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm font-medium leading-tight text-heading">{row.user.firstName} {row.user.lastName}</span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">{row.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="digits text-lg font-medium">{row.gmail}</span></td>
                    <td className="px-5 py-4"><span className="digits text-lg font-medium">{row.domain}</span></td>
                    <td className="px-5 py-4"><span className="digits text-lg font-medium">{row.mask}</span></td>
                    <td className="px-5 py-4"><span className="digits text-lg font-semibold text-blue-600">{row.total}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" disabled={activePage === 1} className="border-none bg-transparent" onClick={() => setPage((value) => Math.max(value - 1, 1))}>
              <ChevronLeft className="size-4" strokeWidth={3} />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <Button key={pageNumber} type="button" variant={pageNumber === activePage ? "default" : "outline"} size="sm" className={cn("size-8 rounded-sm p-0", pageNumber === activePage ? "bg-black hover:bg-black/80" : "bg-transparent")} onClick={() => setPage(pageNumber)}>
                {pageNumber}
              </Button>
            ))}
            <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" disabled={activePage === pageCount} className="border-none bg-transparent" onClick={() => setPage((value) => Math.min(value + 1, pageCount))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}