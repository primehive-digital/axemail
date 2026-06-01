"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn(
        "relative p-3 pt-4 font-inter text-sm text-heading [&_.rdp-button_next]:absolute [&_.rdp-button_next]:right-3 [&_.rdp-button_next]:top-3 [&_.rdp-button_next]:rounded-full [&_.rdp-button_next]:border [&_.rdp-button_next]:border-border [&_.rdp-button_next]:p-1 [&_.rdp-button_previous]:absolute [&_.rdp-button_previous]:left-3 [&_.rdp-button_previous]:top-3 [&_.rdp-button_previous]:rounded-full [&_.rdp-button_previous]:border [&_.rdp-button_previous]:border-border [&_.rdp-button_previous]:p-1 [&_.rdp-caption_label]:block [&_.rdp-caption_label]:px-9 [&_.rdp-caption_label]:text-center [&_.rdp-caption_label]:font-google-sans [&_.rdp-caption_label]:font-semibold [&_.rdp-day_button]:size-9 [&_.rdp-day_button]:rounded-full [&_.rdp-day_button]:text-sm [&_.rdp-day_button]:transition-colors [&_.rdp-day_button:hover]:bg-secondary [&_.rdp-months]:flex [&_.rdp-months]:gap-6 [&_.rdp-month_caption]:mb-3 [&_.rdp-nav]:contents [&_.rdp-outside]:text-muted-foreground/50 [&_.rdp-range_end_.rdp-day_button]:bg-primary [&_.rdp-range_end_.rdp-day_button]:text-primary-foreground [&_.rdp-range_middle_.rdp-day_button]:bg-primary/10 [&_.rdp-range_middle_.rdp-day_button]:text-heading [&_.rdp-range_start_.rdp-day_button]:bg-primary [&_.rdp-range_start_.rdp-day_button]:text-primary-foreground [&_.rdp-selected_.rdp-day_button]:bg-primary [&_.rdp-selected_.rdp-day_button]:text-primary-foreground [&_.rdp-weekday]:font-google-sans [&_.rdp-weekday]:text-xs [&_.rdp-weekday]:font-semibold [&_.rdp-weekday]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar };
