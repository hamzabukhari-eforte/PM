"use client";

import { Clock } from "lucide-react";
import type { Task } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  formatStopwatch,
  formatStopwatchCompact,
} from "@/lib/utils/format-duration";
import {
  shouldShowProjectTaskTimer,
  useProjectTaskTimer,
} from "@/lib/hooks/use-project-task-timer";

export function ProjectTaskTimerBadge({
  task,
  size = "sm",
}: {
  task: Task;
  size?: "sm" | "md";
}) {
  const seconds = useProjectTaskTimer(task);
  const isRunning = task.status === "in_progress";
  if (!shouldShowProjectTaskTimer(task)) return null;

  const sm = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono tabular-nums",
        sm
          ? "gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
          : "gap-1.5 rounded-md px-2 py-1 text-xs",
        isRunning ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500",
      )}
      title={formatStopwatch(seconds)}
    >
      <Clock className={cn(sm ? "h-3 w-3" : "h-3.5 w-3.5", isRunning && "animate-pulse")} />
      {formatStopwatchCompact(seconds)}
    </span>
  );
}
