"use client";

import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const TABLE_PAGE_SIZE = 10;
export const tableClassName = "w-full border-collapse";
export const tableHeaderRowClassName = "border-b border-border bg-slate-50";
export const tableHeaderCellClassName = "sticky top-0 z-10 bg-slate-50 px-5 py-3.5 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-slate-500";
export const tableRowClassName = "border-b border-border transition-colors last:border-b-0 hover:bg-slate-50/80";
export const tableCellClassName = "px-5 py-3.5 align-middle";

export function useTablePagination<Row>(rows: Row[], pageSize = TABLE_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(Math.ceil(rows.length / pageSize), 1);
  const activePage = Math.min(page, pageCount);
  const visibleRows = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [activePage, pageSize, rows]);

  return { activePage, pageCount, setPage, visibleRows };
}

export function ProfessionalTableViewport({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("h-140 overflow-auto bg-white", className)}>
      {children}
    </div>
  );
}

export function ProfessionalTablePagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 border-t border-border bg-white px-5 py-3">
      <p className="font-inter text-xs text-muted-foreground">
        Maximum {TABLE_PAGE_SIZE} rows per page
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page === 1}
          className="rounded-md bg-white"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="digits min-w-24 text-center text-xs font-semibold text-slate-600">
          Page {page} of {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page === pageCount}
          className="rounded-md bg-white"
          onClick={() => onPageChange(Math.min(page + 1, pageCount))}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ProfessionalTableEmpty({
  colSpan,
  message,
  isLoading,
}: {
  colSpan: number;
  message: string;
  isLoading?: boolean;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-112 px-5 text-center">
        <span className="inline-flex items-center gap-2 font-inter text-sm text-muted-foreground">
          {isLoading && <LoaderCircle className="size-5 animate-spin text-primary" />}
          {message}
        </span>
      </td>
    </tr>
  );
}
