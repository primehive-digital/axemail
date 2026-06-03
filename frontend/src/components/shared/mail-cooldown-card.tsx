import type { CSSProperties } from "react";
import { Timer } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MailCooldownCardProps = {
  title: string;
  remainingSeconds: number;
  totalSeconds: number;
  className?: string;
};

function formatCooldown(seconds: number) {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function MailCooldownCard({
  title,
  remainingSeconds,
  totalSeconds,
  className,
}: MailCooldownCardProps) {
  const progress =
    totalSeconds > 0
      ? Math.min(Math.max(remainingSeconds / totalSeconds, 0), 1) * 100
      : 0;

  return (
    <Card
      className={cn(
        "rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0",
        className,
      )}
    >
      <CardContent className="flex min-h-52 flex-col gap-5 p-5 lg:flex-row">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary lg:h-full lg:min-h-40 lg:w-3">
          <span
            className="absolute bottom-0 left-0 rounded-full bg-[#efb100] transition-[height,width] duration-500 ease-out max-lg:h-full max-lg:w-(--cooldown-progress) lg:h-(--cooldown-progress) lg:w-full"
            style={
              {
                "--cooldown-progress": `${progress}%`,
              } as CSSProperties
            }
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
          <div className="space-y-3 max-lg:flex max-lg:items-start max-lg:gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-border bg-accent text-accent-foreground">
              <Timer className="size-5" strokeWidth={2.4} />
            </span>
            <div>
              <h2 className="font-google-sans text-lg font-semibold text-heading">
                {title}
              </h2>
              <p className="font-inter text-sm leading-5 text-muted-foreground">
                Wait before sending the next mail.
              </p>
            </div>
          </div>

          <div>
            <span className="digits text-4xl font-semibold leading-none">
              {formatCooldown(remainingSeconds)}
            </span>
            <p className="mt-1 font-inter text-xs font-medium text-muted-foreground">
              cooldown remaining
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
