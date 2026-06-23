"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Flag, Link2 } from "lucide-react";
import type { PlanGanttChart as PlanGanttChartData } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const LABEL_WIDTH = 220;
const CHART_MIN_WIDTH = 480;
const ROW_HEIGHT = 40;

function buildTicks(rangeStart: Date, rangeEnd: Date, count = 6): Date[] {
  const span = rangeEnd.getTime() - rangeStart.getTime();
  if (span <= 0) return [rangeStart];

  const ticks: Date[] = [];
  for (let i = 0; i < count; i++) {
    const t = rangeStart.getTime() + (span * i) / (count - 1 || 1);
    ticks.push(new Date(t));
  }
  return ticks;
}

function barPosition(
  start: Date,
  end: Date,
  rangeStart: Date,
  rangeEnd: Date,
): { left: number; width: number } {
  const span = Math.max(rangeEnd.getTime() - rangeStart.getTime(), 1);
  const left = ((start.getTime() - rangeStart.getTime()) / span) * 100;
  const width = ((end.getTime() - start.getTime()) / span) * 100;
  return {
    left: Math.max(0, Math.min(100, left)),
    width: Math.max(1.5, Math.min(100 - left, width)),
  };
}

export function PlanGanttChart({ data }: { data: PlanGanttChartData }) {
  const rangeStart = useMemo(() => new Date(data.rangeStart), [data.rangeStart]);
  const rangeEnd = useMemo(() => new Date(data.rangeEnd), [data.rangeEnd]);
  const ticks = useMemo(() => buildTicks(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const todayPercent = useMemo(() => {
    const now = Date.now();
    const span = rangeEnd.getTime() - rangeStart.getTime();
    if (span <= 0) return null;
    if (now < rangeStart.getTime() || now > rangeEnd.getTime()) return null;
    return ((now - rangeStart.getTime()) / span) * 100;
  }, [rangeStart, rangeEnd]);

  if (data.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No plan items with start and end dates yet. Add timelines on the project plan.
      </p>
    );
  }

  return (
    <div className="scrollbar-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div
        className="min-w-full"
        style={{ minWidth: LABEL_WIDTH + CHART_MIN_WIDTH }}
      >
        <div className="flex border-b border-slate-200 bg-slate-50/80 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          <div
            className="shrink-0 border-r border-slate-200 px-3 py-2.5"
            style={{ width: LABEL_WIDTH }}
          >
            WBS / task
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="flex justify-between px-2 py-2.5">
              {ticks.map((tick) => (
                <span key={tick.toISOString()} className="tabular-nums">
                  {format(tick, "MMM d")}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          {data.items.map((item) => {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            const { left, width } = barPosition(start, end, rangeStart, rangeEnd);

            return (
              <div
                key={item.id}
                className="flex border-b border-slate-100 last:border-b-0"
                style={{ minHeight: ROW_HEIGHT }}
              >
                <div
                  className="flex shrink-0 items-center gap-1.5 border-r border-slate-100 px-3 py-2"
                  style={{ width: LABEL_WIDTH, paddingLeft: 12 + item.depth * 14 }}
                >
                  <span className="shrink-0 font-mono text-[10px] font-semibold text-indigo-600">
                    {item.code}
                  </span>
                  <span className="min-w-0 truncate text-xs text-slate-800" title={item.title}>
                    {item.title}
                  </span>
                  {item.isMilestone && (
                    <Flag className="h-3 w-3 shrink-0 text-amber-500" aria-label="Milestone" />
                  )}
                </div>

                <div className="relative min-w-0 flex-1 px-2 py-2">
                  <div className="relative h-6">
                    {item.isMilestone ? (
                      <div
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-amber-400 ring-2 ring-amber-200"
                        style={{ left: `${left + width / 2}%` }}
                        title={item.milestoneNo ? `Milestone ${item.milestoneNo}` : "Milestone"}
                      />
                    ) : (
                      <div
                        className={cn(
                          "absolute top-1/2 h-5 -translate-y-1/2 rounded-md shadow-sm",
                          item.kind === "subtask"
                            ? "bg-violet-400/85"
                            : "bg-indigo-500",
                        )}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${format(start, "MMM d")} – ${format(end, "MMM d")}`}
                      />
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                    {item.assigneeNames.length > 0 && (
                      <span>{item.assigneeNames.join(", ")}</span>
                    )}
                    {item.dependentTaskCode && (
                      <span className="flex items-center gap-0.5 text-indigo-600">
                        <Link2 className="h-2.5 w-2.5" />
                        {item.dependentTaskCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {todayPercent !== null && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-rose-400"
              style={{ left: `calc(${LABEL_WIDTH}px + (100% - ${LABEL_WIDTH}px) * ${todayPercent / 100})` }}
              aria-hidden
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 bg-slate-50/50 px-3 py-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-6 rounded-sm bg-indigo-500" />
          Task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-6 rounded-sm bg-violet-400/85" />
          Subtask
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-sm bg-amber-400" />
          Milestone
        </span>
        {todayPercent !== null && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-px bg-rose-400" />
            Today
          </span>
        )}
      </div>
    </div>
  );
}
