import Image from "next/image";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

const resourceLimits = [
  {
    resource: "Gmail",
    description: "Gmail mailer pool",
    iconSrc: "/icons/gmail-logo.png",
    iconAlt: "Gmail",
    perAccount: 25,
    perDay: 100,
    perMonth: 3000,
  },
  {
    resource: "Domain",
    description: "Domain mailer pool",
    iconSrc: "/icons/domain-logo.png",
    iconAlt: "Domain",
    perAccount: 50,
    perDay: 250,
    perMonth: 7500,
  },
  {
    resource: "Mask",
    description: "Mask mailer pool",
    iconSrc: "/icons/mask-logo.png",
    iconAlt: "Mask",
    perAccount: 35,
    perDay: 150,
    perMonth: 4500,
  },
];

export function ResourceLimitTableCard() {
  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">
            Resource Limit Table
          </h2>
          <p className="font-inter text-sm text-muted-foreground">
            Review daily and monthly sending limits for each resource.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-72 overflow-x-auto">
          <table className="w-full min-w-160 border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Resource
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Per Account
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Per Day
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Per Month
                </th>
              </tr>
            </thead>
            <tbody>
              {resourceLimits.map((resource) => (
                <tr
                  key={resource.resource}
                  className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary">
                        <Image
                          src={resource.iconSrc}
                          alt={resource.iconAlt}
                          width={22}
                          height={22}
                          className="size-5 object-contain"
                        />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-google-sans text-sm font-medium leading-tight text-heading">
                          {resource.resource}
                        </span>
                        <span className="mt-1 truncate font-inter text-xs text-muted-foreground">
                          {resource.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="digits text-lg font-medium text-heading">
                      {resource.perAccount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="digits text-lg font-semibold text-blue-600">
                      {resource.perDay.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="digits text-lg font-medium text-heading">
                      {resource.perMonth.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
