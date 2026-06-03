import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

export function MailerProgressCard({
  title,
  description,
  logoSrc,
  logoAlt,
  sent,
  target,
}: {
  title: string;
  description: string;
  logoSrc: string;
  logoAlt: string;
  sent: number;
  target: number;
}) {
  const progress =
    target > 0 ? Math.min(Math.round((sent / target) * 100), 100) : 0;

  return (
    <Card className="rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
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
              {progress}%
            </span>
            <span className="font-inter text-xs font-medium text-muted-foreground">
              progress
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-secondary p-4">
              <p className="font-inter text-xs font-medium text-muted-foreground">
                Sent
              </p>
              <p className="digits mt-2 text-3xl font-semibold leading-none">
                {sent.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary p-4">
              <p className="font-inter text-xs font-medium text-muted-foreground">
                Target
              </p>
              <p className="digits mt-2 text-3xl font-semibold leading-none">
                {target.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
