import { Activity, Clock3, Link, ServerCrash } from "lucide-react";

import { TableActionButton } from "@/components/shared/table-actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MaskServerHealth } from "@/lib/infrastructure-control/infrastructure-control-api";

function formatDetails(details: unknown) {
  if (typeof details === "string") {
    return details;
  }

  if (!details) {
    return "No response details available.";
  }

  try {
    return JSON.stringify(details);
  } catch {
    return "Unable to read response details.";
  }
}

export function MaskMailerServerCard({
  server,
  isLoading,
  isTesting,
  onTest,
}: {
  server?: MaskServerHealth;
  isLoading?: boolean;
  isTesting?: boolean;
  onTest: () => Promise<unknown> | void;
}) {
  const status = server?.status ?? "not_working";
  const serverDetails = [
    {
      label: "Server Health",
      value: isLoading ? "Checking mask server..." : formatDetails(server?.details),
      icon: ServerCrash,
      className: "md:col-span-2",
      valueClassName: status === "active" ? "text-emerald-700" : "text-destructive",
    },
    {
      label: "Status",
      value: status === "active" ? "Active" : "Not Working",
      icon: Activity,
      className: "md:col-span-1",
      valueClassName: status === "active" ? "text-emerald-700" : "text-yellow-700",
    },
    {
      label: "Response Time",
      value: `${server?.responseTimeMs ?? 0} ms`,
      icon: Clock3,
      className: "md:col-span-1",
      valueClassName: "text-heading",
    },
    {
      label: "Endpoint",
      value: server?.endpoint ?? "Not configured",
      icon: Link,
      className: "md:col-span-2",
      valueClassName: "text-heading",
    },
  ];

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Mask Mailer Server</h2>
            <p className="font-inter text-sm text-muted-foreground">Validate backend connectivity to the mask delivery endpoint.</p>
          </div>

          <TableActionButton action="test" label="Test Server" isPending={isTesting} className="h-10 px-4 text-sm" onClick={() => onTest()} />
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 md:grid-cols-2">
        {serverDetails.map((detail) => {
          const Icon = detail.icon;

          return (
            <div key={detail.label} className={`rounded-xl border border-border bg-secondary p-4 ${detail.className}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-google-sans text-sm font-semibold text-heading">{detail.label}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className={`mt-3 wrap-break-word font-inter text-sm font-medium ${detail.valueClassName}`}>{detail.value}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
