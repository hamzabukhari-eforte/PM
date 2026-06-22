"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, GripVertical, MoreHorizontal } from "lucide-react";
import type { Board, Task } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatStopwatch,
  formatStopwatchCompact,
} from "@/lib/utils/format-duration";
import {
  shouldShowProjectTaskTimer,
  useProjectTaskTimer,
} from "@/lib/hooks/use-project-task-timer";
import {
  buildTaskHierarchyIndex,
  countAllSubtasks,
  type TaskHierarchyEntry,
} from "@/lib/utils/task-hierarchy";
import { SubtaskList } from "@/components/kanban/subtask-list";

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
          ? "bg-indigo-50 text-indigo-700"
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
  board,
  hierarchyIndex: hierarchyIndexProp,
  isDragging,
  onOpen,
  onEdit,
  onArchive,
  canArchive = false,
}: {
  task: Task;
  board?: Board;
  hierarchyIndex?: Map<string, TaskHierarchyEntry>;
  isDragging?: boolean;
  onOpen?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  canArchive?: boolean;
}) {
  const hierarchyIndex = useMemo(
    () => hierarchyIndexProp ?? (board ? buildTaskHierarchyIndex(board) : new Map()),
    [hierarchyIndexProp, board],
  );

  const mainLabel = hierarchyIndex.get(task.id)?.label;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const showTimer = shouldShowProjectTaskTimer(task);
  const hasSubtasks = (task.subtasks?.length ?? 0) > 0;
  const subtaskCount = countAllSubtasks(task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-slate-200/90 bg-white shadow-sm transition-shadow hover:border-slate-300 hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-70 shadow-lg ring-2 ring-blue-100",
        task.status === "in_progress" && "border-blue-200/80",
      )}
    >
      <div className="flex items-start gap-1 p-3.5 pb-0">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 transition-opacity hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing opacity-40 group-hover:opacity-100"
          {...attributes}
          {...listeners}
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          onClick={() => onOpen?.(task)}
        >
          <div className="flex items-start gap-2 pr-1">
            {mainLabel && (
              <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-slate-400">
                {mainLabel}
              </span>
            )}
            <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-slate-900">
              {task.title}
            </p>
          </div>
          {task.description?.trim() && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {task.description}
            </p>
          )}
        </button>

        {(onEdit || (canArchive && onArchive)) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                aria-label="Task actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <DropdownMenuItem onSelect={() => onEdit(task)}>Edit</DropdownMenuItem>
              )}
              {canArchive && onArchive && (
                <>
                  {onEdit && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={() => onArchive(task)}
                  >
                    Archive
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <button
        type="button"
        className="w-full cursor-pointer px-3.5 pb-3.5 pt-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-200"
        onClick={() => onOpen?.(task)}
      >
        {showTimer && (
          <div className="mb-2">
            <ProjectTaskTimer task={task} />
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
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
          <div className="flex shrink-0 items-center gap-1.5">
            {subtaskCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {subtaskCount} sub
              </Badge>
            )}
            {task.storyPoints != null && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {task.storyPoints}
              </Badge>
            )}
          </div>
        </div>
      </button>

      {hasSubtasks && (
        <div className="px-3.5 pb-3.5">
          <SubtaskList task={task} hierarchyIndex={hierarchyIndex} />
        </div>
      )}
    </div>
  );
}
