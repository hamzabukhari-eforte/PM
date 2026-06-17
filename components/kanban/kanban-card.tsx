"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock } from "lucide-react";
import type { Task } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  formatStopwatch,
  formatStopwatchCompact,
} from "@/lib/utils/format-duration";
import {
  shouldShowProjectTaskTimer,
  useProjectTaskTimer,
} from "@/lib/hooks/use-project-task-timer";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ProjectTaskTimer({ task }: { task: Task }) {
  const seconds = useProjectTaskTimer(task);
  const isRunning = task.status === "in_progress";

  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums",
        isRunning
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-500",
      )}
      title={formatStopwatch(seconds)}
    >
      <Clock className={cn("h-3 w-3", isRunning && "animate-pulse")} />
      {formatStopwatchCompact(seconds)}
    </span>
  );
}

export function KanbanCard({
  task,
  isDragging,
}: {
  task: Task;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const showTimer = shouldShowProjectTaskTimer(task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group cursor-grab rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-shadow active:cursor-grabbing hover:border-slate-300 hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-70 shadow-lg ring-2 ring-blue-100",
        task.status === "in_progress" && "border-blue-200/80",
      )}
    >
      <p className="text-sm font-medium leading-snug text-slate-900">{task.title}</p>
      {showTimer && (
        <div className="mt-2">
          <ProjectTaskTimer task={task} />
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {task.assigneeName ? (
            <>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600"
                title={task.assigneeName}
              >
                {initials(task.assigneeName)}
              </span>
              <span className="truncate text-xs text-slate-500">{task.assigneeName}</span>
            </>
          ) : (
            <span className="text-xs text-slate-400">Unassigned</span>
          )}
        </div>
        {task.storyPoints != null && (
          <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">
            {task.storyPoints}
          </Badge>
        )}
      </div>
    </div>
  );
}
