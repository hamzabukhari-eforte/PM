"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
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
import { AssigneeDisplay } from "@/components/tasks/assignee-display";

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

type KanbanCardProps = {
  task: Task;
  board?: Board;
  hierarchyIndex?: Map<string, TaskHierarchyEntry>;
  overlay?: boolean;
  dragHidden?: boolean;
  onOpen?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  canArchive?: boolean;
};

function KanbanCardView({
  task,
  board,
  hierarchyIndex: hierarchyIndexProp,
  overlay = false,
  onOpen,
  onEdit,
  onArchive,
  canArchive = false,
  dragHandleProps,
}: KanbanCardProps & {
  dragHandleProps?: {
    ref: (element: HTMLElement | null) => void;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
}) {
  const hierarchyIndex = useMemo(
    () => hierarchyIndexProp ?? (board ? buildTaskHierarchyIndex(board) : new Map()),
    [hierarchyIndexProp, board],
  );

  const mainLabel = hierarchyIndex.get(task.id)?.label;
  const showTimer = shouldShowProjectTaskTimer(task) && !overlay;
  const hasSubtasks = (task.subtasks?.length ?? 0) > 0;
  const subtaskCount = countAllSubtasks(task);

  return (
    <div
      className={cn(
        "group rounded-xl border border-slate-200/90 bg-white shadow-sm hover:border-slate-300 hover:shadow-md",
        !overlay && "transition-shadow",
        overlay && "cursor-grabbing shadow-xl ring-2 ring-indigo-100",
        task.status === "in_progress" && "border-blue-200/80",
      )}
    >
      <div className="flex items-start gap-1 p-3.5 pb-0">
        {!overlay && dragHandleProps && (
          <button
            type="button"
            ref={dragHandleProps.ref}
            className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing opacity-40 group-hover:opacity-100"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            aria-label="Drag task"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

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

        {!overlay && (onEdit || (canArchive && onArchive)) && (
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
            <AssigneeDisplay names={task.assigneeNames} compact />
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

      {hasSubtasks && !overlay && (
        <div className="px-3.5 pb-3.5">
          <SubtaskList task={task} hierarchyIndex={hierarchyIndex} />
        </div>
      )}
    </div>
  );
}

function SortableKanbanCard({ dragHidden, ...props }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
      }}
      className={cn((dragHidden || isDragging) && "opacity-0")}
    >
      <KanbanCardView
        {...props}
        dragHandleProps={{
          ref: setActivatorNodeRef,
          attributes,
          listeners,
        }}
      />
    </div>
  );
}

export function KanbanCard(props: KanbanCardProps) {
  if (props.overlay) {
    return (
      <div className="w-[24rem] max-w-[85vw]">
        <KanbanCardView {...props} />
      </div>
    );
  }

  return <SortableKanbanCard {...props} />;
}
