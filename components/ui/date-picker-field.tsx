"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatTicketDateLocal,
  parseTicketDateLocal,
} from "@/lib/utils/ticket-datetime";
import { cn } from "@/lib/utils";

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isFutureLocalCalendarDay(date: Date): boolean {
  return startOfLocalDay(date) > startOfLocalDay(new Date());
}

type Props = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (formatted: string) => void;
  className?: string;
  disableFuture?: boolean;
};

function computeSide(triggerEl: HTMLElement | null): "top" | "bottom" {
  if (typeof window === "undefined" || !triggerEl) return "bottom";
  const r = triggerEl.getBoundingClientRect();
  const spaceBelow = window.innerHeight - r.bottom - 16;
  const spaceAbove = r.top - 16;
  return spaceBelow >= spaceAbove ? "bottom" : "top";
}

export function DatePickerField({
  id,
  label,
  required,
  value = "",
  onChange,
  className,
  disableFuture = false,
}: Props) {
  const normalizedValue = value ?? "";
  const [open, setOpen] = React.useState(false);
  const [side, setSide] = React.useState<"top" | "bottom">("bottom");
  const [draft, setDraft] = React.useState<Date>(() => {
    let d = parseTicketDateLocal(normalizedValue) ?? new Date();
    if (disableFuture && isFutureLocalCalendarDay(d)) d = new Date();
    return startOfLocalDay(d);
  });

  React.useEffect(() => {
    if (!disableFuture) return;
    const parsed = parseTicketDateLocal(normalizedValue);
    if (!parsed || !isFutureLocalCalendarDay(parsed)) return;
    onChange(formatTicketDateLocal(new Date()));
  }, [disableFuture, normalizedValue, onChange]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      let d = parseTicketDateLocal(normalizedValue) ?? new Date();
      if (disableFuture && isFutureLocalCalendarDay(d)) d = new Date();
      setDraft(startOfLocalDay(d));
      const el = document.getElementById(id);
      setSide(computeSide(el));
    }
  };

  const commit = React.useCallback(
    (next: Date) => {
      const day = startOfLocalDay(next);
      setDraft(day);
      onChange(formatTicketDateLocal(day));
    },
    [onChange],
  );

  const display = normalizedValue.trim() ? normalizedValue.trim() : "Pick date";

  return (
    <div className={cn("min-w-0", className)}>
      <span className="block text-xs font-medium text-gray-700">
        {label}
        {required ? (
          <span className="text-red-500" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      <Popover open={open} onOpenChange={handleOpenChange} dismissOnOutsidePointerDown={false}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "mt-1 h-auto min-h-10 w-full justify-start gap-2 px-3 py-2 text-left font-normal",
              !normalizedValue.trim() && "text-gray-500",
            )}
          >
            <CalendarDays className="size-4 shrink-0 opacity-60" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{display}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(100vw-3rem,17.5rem)]"
          align="start"
          side={side}
          sideOffset={4}
          onWheel={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={draft}
                onSelect={(d) => {
                  if (!d) return;
                  commit(d);
                  setOpen(false);
                }}
                disabled={disableFuture ? isFutureLocalCalendarDay : undefined}
                className="mx-auto [--rdp-accent-color:#4338ca] [--rdp-accent-background-color:#eef2ff]"
              />
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
