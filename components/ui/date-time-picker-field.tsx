"use client";

import * as React from "react";
import { CalendarDays, Clock2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatTicketDateTimeLocal,
  parseTicketDateTimeLocal,
} from "@/lib/utils/ticket-datetime";
import { cn } from "@/lib/utils";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function timeValueForInput(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function mergeTimeOntoDate(base: Date, timeStr: string): Date {
  const parts = timeStr.split(":").map((x) => Number(x));
  const h = parts[0] ?? 0;
  const min = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  const out = new Date(base);
  out.setHours(h, min, s, 0);
  return out;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isFutureLocalCalendarDay(date: Date): boolean {
  return startOfLocalDay(date) > startOfLocalDay(new Date());
}

function clampDateTimeToNow(d: Date): Date {
  const now = new Date();
  return d > now ? now : d;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime();
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

export function DateTimePickerField({
  id,
  label,
  required,
  value,
  onChange,
  className,
  disableFuture = false,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [side, setSide] = React.useState<"top" | "bottom">("bottom");
  const timeInputRef = React.useRef<HTMLInputElement>(null);
  const [draft, setDraft] = React.useState<Date>(() => {
    let d = parseTicketDateTimeLocal(value) ?? new Date();
    if (disableFuture) d = clampDateTimeToNow(d);
    return d;
  });

  React.useEffect(() => {
    if (!disableFuture) return;
    const parsed = parseTicketDateTimeLocal(value);
    if (!parsed || parsed <= new Date()) return;
    onChange(formatTicketDateTimeLocal(new Date()));
  }, [disableFuture, value, onChange]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      let d = parseTicketDateTimeLocal(value) ?? new Date();
      if (disableFuture) d = clampDateTimeToNow(d);
      setDraft(d);
      const el = document.getElementById(id);
      setSide(computeSide(el));
    }
  };

  const commit = React.useCallback(
    (next: Date) => {
      setDraft(next);
      onChange(formatTicketDateTimeLocal(next));
    },
    [onChange],
  );

  const display = value.trim() ? value.trim() : "Pick date & time";

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
              !value.trim() && "text-gray-500",
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
                  let next = mergeTimeOntoDate(d, timeValueForInput(draft));
                  if (disableFuture) next = clampDateTimeToNow(next);
                  commit(next);
                  requestAnimationFrame(() => {
                    timeInputRef.current?.focus();
                    timeInputRef.current?.showPicker?.();
                  });
                }}
                disabled={disableFuture ? isFutureLocalCalendarDay : undefined}
                className="mx-auto [--rdp-accent-color:#4338ca] [--rdp-accent-background-color:#eef2ff]"
              />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2 border-t border-gray-100 bg-gray-50/90 p-2 sm:p-2">
              <FieldGroup className="w-full">
                <Field>
                  <FieldLabel htmlFor={`${id}-time`}>Time</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      ref={timeInputRef}
                      id={`${id}-time`}
                      type="time"
                      step="1"
                      value={timeValueForInput(draft)}
                      max={
                        disableFuture && isSameLocalDay(draft, new Date())
                          ? timeValueForInput(new Date())
                          : undefined
                      }
                      onChange={(e) => {
                        let next = mergeTimeOntoDate(draft, e.target.value);
                        if (disableFuture) next = clampDateTimeToNow(next);
                        commit(next);
                      }}
                      className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                    <InputGroupAddon>
                      <Clock2 className="size-4 text-gray-500" aria-hidden />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </FieldGroup>
              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={() => {
                  const next = disableFuture ? clampDateTimeToNow(draft) : draft;
                  commit(next);
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
