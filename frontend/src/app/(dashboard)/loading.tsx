import { Skeleton } from "@/components/ui/skeleton";

function DashboardMetricSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="size-12 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="mt-8 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

function DashboardTableSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm shadow-black/5">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        {withAction && <Skeleton className="h-10 w-32 rounded-full" />}
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1.4fr_1.2fr] gap-4 border-b border-border bg-secondary/60 px-5 py-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1.4fr_1.2fr] gap-4 border-b border-border px-5 py-4 last:border-b-0">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 self-center rounded-full" />
            <div className="space-y-2 self-center">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="flex gap-2 self-center">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <Skeleton className="size-8 rounded-sm" />
        <Skeleton className="size-8 rounded-sm" />
        <Skeleton className="size-8 rounded-sm" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-120 max-w-full" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <DashboardMetricSkeleton key={index} />
          ))}
        </div>
      </section>

      <DashboardTableSkeleton />
      <DashboardTableSkeleton />
    </div>
  );
}