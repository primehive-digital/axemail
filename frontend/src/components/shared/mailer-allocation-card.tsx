import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MailerAllocationCardProps = {
  title: string;
  description: string;
  logoSrc: string;
  logoAlt: string;
  assigned: number;
  limit: number;
  className?: string;
};

export function MailerAllocationCard({
  title,
  description,
  logoSrc,
  logoAlt,
  assigned,
  limit,
  className,
}: MailerAllocationCardProps) {
  const remaining = Math.max(limit - assigned, 0);

  return (
    <Card
      className={cn(
        "rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0",
        className
      )}
    >
      <CardContent className="flex min-h-52 flex-col justify-between gap-6 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-secondary">
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={32}
                height={32}
                className="size-8 object-contain"
              />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-google-sans text-lg font-semibold text-heading">
                {title}
              </h2>
              <p className="font-inter text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="digits block text-4xl font-semibold leading-none">
              {limit}
            </span>
            <span className="font-inter text-xs font-medium text-muted-foreground">
              limit
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-border bg-secondary p-4">
            <p className="font-inter text-xs font-medium text-muted-foreground">
              Assigned
            </p>
            <p className="digits mt-2 text-3xl font-semibold leading-none">
              {assigned}
            </p>
          </div>
          <div className="rounded-xl border-2 border-border bg-secondary p-4">
            <p className="font-inter text-xs font-medium text-muted-foreground">
              Remaining
            </p>
            <p className="digits mt-2 text-3xl font-semibold leading-none">
              {remaining}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
