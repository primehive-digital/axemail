import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricBadgeTone = "blue" | "emerald" | "violet" | "amber";

type MetricCardProps = {
  title: string;
  value: number;
  total?: number;
  iconSrc: string;
  iconAlt: string;
  label?: string;
  description?: string;
  badgeTone?: MetricBadgeTone;
  className?: string;
};

const badgeToneClassName: Record<MetricBadgeTone, string> = {
  blue: "border-blue-600 bg-blue-600 text-white",
  emerald: "border-emerald-600 bg-emerald-600 text-white",
  violet: "border-violet-600 bg-violet-600 text-white",
  amber: "border-amber-500 bg-amber-500 text-white",
};

export function MetricCard({
  title,
  value,
  total,
  iconSrc,
  iconAlt,
  label = "",
  description,
  badgeTone,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0",
        className,
      )}
    >
      <CardContent className="flex min-h-36 flex-col justify-between gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-accent text-accent-foreground">
            <Image
              src={iconSrc}
              alt={iconAlt}
              width={28}
              height={28}
              className="size-8 object-contain"
            />
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 font-inter text-xs font-medium",
              badgeTone
                ? badgeToneClassName[badgeTone]
                : "border-[#00a664] bg-[#00a664]/20 text-[#00a664]",
            )}
          >
            {label}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <h2 className="font-google-sans text-sm font-semibold leading-5 text-heading">
              {title}
            </h2>
            {description && (
              <p className="mt-1 font-inter text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-end gap-1.5">
            <span className="digits text-4xl font-bold leading-none">
              {value}
            </span>
            {typeof total === "number" && (
              <span className="digits pb-1 text-base font-medium text-muted-foreground">
                /{total}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
