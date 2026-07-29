"use client";

import { UserRound } from "lucide-react";

import { AllocationLimitDialog } from "@/components/pages/administration/allocation-management/allocation-limit-dialog";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AllocationPool, AllocationRow, AllocationUser, AssignAllocationPayload } from "@/lib/allocation-management/allocation-management-api";
import { cn } from "@/lib/utils";

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
  const pagination = useTablePagination(rows);

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Allocation Table</h2>
            <p className="font-inter text-sm text-muted-foreground">Review assigned daily mailer limits for employees.</p>
          </div>
          <AllocationLimitDialog pools={pools} users={users} rows={rows} onSubmit={onAssignAllocation} isPending={isAssigning} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ProfessionalTableViewport>
          <table className={cn(tableClassName, "min-w-240")}>
            <thead>
              <tr className={tableHeaderRowClassName}>
                {["User", "Gmail Allocation", "Domain Allocation", "Mask Allocation", "Total Allocation"].map((heading) => (
                  <th key={heading} className={tableHeaderCellClassName}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <ProfessionalTableEmpty colSpan={5} message="Loading allocations" isLoading />
              ) : pagination.visibleRows.length === 0 ? (
                <ProfessionalTableEmpty colSpan={5} message="No employee allocations found." />
              ) : pagination.visibleRows.map((row) => (
                <tr key={row.user.id} className={tableRowClassName}>
                  <td className={tableCellClassName}>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-slate-50 text-slate-600">
                        <UserRound className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-google-sans text-sm font-semibold text-heading">{row.user.firstName} {row.user.lastName}</p>
                        <p className="mt-0.5 truncate font-inter text-xs text-muted-foreground">{row.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={tableCellClassName}><span className="digits text-base font-medium">{row.gmail.toLocaleString()}</span></td>
                  <td className={tableCellClassName}><span className="digits text-base font-medium">{row.domain.toLocaleString()}</span></td>
                  <td className={tableCellClassName}><span className="digits text-base font-medium">{row.mask.toLocaleString()}</span></td>
                  <td className={tableCellClassName}><span className="digits text-base font-semibold text-blue-700">{row.total.toLocaleString()}</span></td>
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
  );
}
