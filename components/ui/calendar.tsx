"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerProps;

function CalendarDayButton({
  className,
  modifiers,
  ...props
}: React.ComponentProps<"button"> & {
  modifiers: { selected?: boolean; today?: boolean; disabled?: boolean };
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-0 text-sm font-normal transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        modifiers.disabled && "cursor-not-allowed opacity-50",
        modifiers.selected
          ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
          : "hover:bg-indigo-200 hover:text-indigo-950",
        modifiers.today &&
          !modifiers.selected &&
          "bg-indigo-50 font-medium text-indigo-900 hover:bg-indigo-200 hover:text-indigo-950",
        className,
      )}
      {...props}
    />
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-2",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white p-0 opacity-80 hover:opacity-100",
        ),
        button_next: cn(
          "absolute right-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white p-0 opacity-80 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: "",
        selected: "",
        today: "",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
