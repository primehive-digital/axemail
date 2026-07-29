"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { MetricCard } from "@/components/shared/metric-card";
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
import { getUsageLimitsDashboard, type SenderLimit } from "@/lib/usage-limits/usage-limits-api";

const metricAssets: Record<string, { iconSrc: string; iconAlt: string }> = {
  totalGmailAccounts: { iconSrc: "/icons/total-gmails-icon.png", iconAlt: "Gmail accounts" },
  totalDomains: { iconSrc: "/icons/total-domains-icon.png", iconAlt: "Domain accounts" },
  totalServers: { iconSrc: "/icons/total-servers-icon.png", iconAlt: "Mask servers" },
};

const resourceAssets: Record<SenderLimit["key"], { iconSrc: string; iconAlt: string }> = {
  gmail: { iconSrc: "/icons/gmail-logo.png", iconAlt: "Gmail" },
  domain: { iconSrc: "/icons/domain-logo.png", iconAlt: "Domain" },
  mask: { iconSrc: "/icons/mask-logo.png", iconAlt: "Mask" },
};

export function UsageLimitsDashboard() {
  const query = useQuery({ queryKey: ["usage-limits-dashboard"], queryFn: getUsageLimitsDashboard });
  const limits = query.data?.limits ?? [];
  const pagination = useTablePagination(limits);

  return (
    <div className="flex flex-1 flex-col gap-10 p-4 lg:p-6">
      <section className="space-y-4">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Usage & Limits</h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">Sender capacity and daily/monthly limits without background analytics.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(query.data?.metrics ?? []).map((metric) => {
            const asset = metricAssets[metric.key];
            return (
              <MetricCard key={metric.key} title={metric.title} label={metric.label} value={metric.value} description={metric.description} iconSrc={asset.iconSrc} iconAlt={asset.iconAlt} />
            );
          })}
        </div>
      </section>

      <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm">
        <CardHeader className="border-b px-5 py-5">
          <h2 className="font-google-sans text-xl font-semibold text-heading">Sender Limits</h2>
          <p className="font-inter text-sm text-muted-foreground">Configured capacity for each sender type.</p>
        </CardHeader>
        <CardContent className="p-0">
          <ProfessionalTableViewport>
          <table className={`${tableClassName} min-w-180`}>
            <thead><tr className={tableHeaderRowClassName}>
              <th className={tableHeaderCellClassName}>Sender</th>
              <th className={tableHeaderCellClassName}>Per Account</th>
              <th className={tableHeaderCellClassName}>Per Day</th>
              <th className={tableHeaderCellClassName}>Per Month</th>
            </tr></thead>
            <tbody>
              {query.isLoading ? <ProfessionalTableEmpty colSpan={4} message="Loading sender limits" isLoading /> :
              pagination.visibleRows.length === 0 ? <ProfessionalTableEmpty colSpan={4} message="No sender limits found." /> :
              pagination.visibleRows.map((limit) => {
                const asset = resourceAssets[limit.key];
                return (
                  <tr key={limit.key} className={tableRowClassName}>
                    <td className={tableCellClassName}><span className="flex items-center gap-3"><Image src={asset.iconSrc} alt={asset.iconAlt} width={24} height={24} /><span><strong className="block text-sm">{limit.resource}</strong><small className="text-muted-foreground">{limit.description}</small></span></span></td>
                    <td className={`${tableCellClassName} digits`}>{limit.perAccount.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits`}>{limit.perDay.toLocaleString()}</td>
                    <td className={`${tableCellClassName} digits`}>{limit.perMonth.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </ProfessionalTableViewport>
          <ProfessionalTablePagination page={pagination.activePage} pageCount={pagination.pageCount} onPageChange={pagination.setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
