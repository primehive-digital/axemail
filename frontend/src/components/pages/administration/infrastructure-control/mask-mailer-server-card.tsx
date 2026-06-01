import { Activity, Clock3, Link, PlugZap, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const serverDetails = [
  {
    label: "Server Health",
    value: "connect ECONNREFUSED 194.163.177.61:443",
    icon: ServerCrash,
    className: "md:col-span-2",
    valueClassName: "text-destructive",
  },
  {
    label: "Status",
    value: "Connection Refused",
    icon: Activity,
    className: "md:col-span-1",
    valueClassName: "text-yellow-700",
  },
  {
    label: "Response Time",
    value: "0 ms",
    icon: Clock3,
    className: "md:col-span-1",
    valueClassName: "text-heading",
  },
  {
    label: "Endpoint",
    value: "https://194.163.177.61",
    icon: Link,
    className: "md:col-span-2",
    valueClassName: "text-heading",
  },
];

export function MaskMailerServerCard() {
  return (
    <Card className="gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b-2 px-5 py-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">
              Mask Mailer Server
            </h2>
            <p className="font-inter text-sm text-muted-foreground">
              Validate backend connectivity to the mask delivery endpoint.
            </p>
          </div>

          <Button
            type="button"
            className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20"
          >
            <PlugZap className="size-4" />
            Test Server
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 md:grid-cols-2">
        {serverDetails.map((detail) => {
          const Icon = detail.icon;

          return (
            <div
              key={detail.label}
              className={`rounded-xl border-2 border-border bg-secondary p-4 ${detail.className}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-google-sans text-sm font-semibold text-heading">
                  {detail.label}
                </span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p
                className={`mt-3 wrap-break-word font-inter text-sm font-medium ${detail.valueClassName}`}
              >
                {detail.value}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
