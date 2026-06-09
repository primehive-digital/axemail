"use client";

import { useState } from "react";
import { Clock3, LoaderCircle, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MailerCustomization } from "@/lib/mailer-customization/mailer-customization-api";

export function CooldownSettingsCard({
  mailer,
  isPending,
  onSave,
}: {
  mailer: MailerCustomization;
  isPending?: boolean;
  onSave: (schedule: number[]) => void;
}) {
  const [value, setValue] = useState(mailer.cooldownSchedule.join(", "));


  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const schedule = value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0 && item <= 3600);

    if (schedule.length === 0) {
      toast.error("Add at least one valid cooldown value.");
      return;
    }

    onSave(schedule);
  }

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">Cooldown Settings</h2>
          <p className="mt-1 font-inter text-sm text-muted-foreground">
            {mailer.cooldownEnabled ? "Set randomized cooldown values in seconds." : "Mask mailer sends through the server and does not use per-mail cooldown."}
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5">
        {mailer.cooldownEnabled ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="cooldown-schedule" className="font-google-sans text-sm font-semibold text-heading">Cooldown values</Label>
              <div className="relative mt-2">
                <Clock3 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="cooldown-schedule" value={value} onChange={(event) => setValue(event.target.value)} placeholder="20, 35, 50, 70, 90" className="h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <p className="mt-2 font-inter text-xs leading-5 text-muted-foreground">Separate values with commas. Sending randomly picks one value for each cooldown.</p>
            </div>
            <div className="flex justify-end">
              <Button disabled={isPending} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Cooldown
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-secondary/60 p-5 font-inter text-sm leading-6 text-muted-foreground">
            Cooldown is disabled for mask mailer. Reply-to options can still be controlled from this page.
          </div>
        )}
      </CardContent>
    </Card>
  );
}


