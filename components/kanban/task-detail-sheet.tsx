"use client";

import { useMemo } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, GripVertical, Link2, Pencil, ClipboardList } from "lucide-react";
import type { SubTask, Task } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatStopwatch,
  formatStopwatchCompact,
} from "@/lib/utils/format-duration";
import {
  shouldShowProjectTaskTimer,
  useProjectTaskTimer,
} from "@/lib/hooks/use-project-task-timer";
import {
  countAllSubtasks,
  countCompletedSubtasks,
  formatHierarchyLabel,
  panelSubtaskSortId,
  sortedSubtaskList,
  type TaskHierarchyEntry,
} from "@/lib/utils/task-hierarchy";
import { statusFlowLabel } from "@/lib/utils/task-status-flow";
import { cn } from "@/lib/utils";

function DetailTimer({ task }: { task: Task }) {
  const seconds = useProjectTaskTimer(task);
  const isRunning = task.status === "in_progress";
  if (!shouldShowProjectTaskTimer(task)) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs tabular-nums",
        isRunning ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600",
      )}
      title={formatStopwatch(seconds)}
    >
      <Clock className={cn("h-3.5 w-3.5", isRunning && "animate-pulse")} />
      {formatStopwatchCompact(seconds)}
    </span>
  );
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}

function ProseBlock({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="text-sm italic text-slate-400">No description provided.</p>;
  }
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{text}</p>
  );
}

function DetailSubtaskRow({
  parentId,
  sub,
  hierarchyIndex,
  depth,
  onToggleSubtask,
  togglingSubtaskId,
}: {
  parentId: string;
  sub: SubTask;
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  depth: number;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
  togglingSubtaskId?: string | null;
}) {
  const hierarchyLabel = hierarchyIndex.get(sub.id)?.label ?? "?";
  const linkLabel = sub.linkedTaskId
    ? formatHierarchyLabel(hierarchyIndex, sub.linkedTaskId)
    : null;
  const isToggling = togglingSubtaskId === sub.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panelSubtaskSortId(parentId, sub.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li className="space-y-2">
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors",
          sub.completed && "border-slate-100 bg-slate-50/80",
          isDragging && "opacity-60 ring-2 ring-blue-100",
        )}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${sub.title}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={sub.completed}
              disabled={!onToggleSubtask || isToggling}
              onChange={(e) => onToggleSubtask?.(sub.id, e.target.checked)}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Mark ${sub.title} as ${sub.completed ? "incomplete" : "complete"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 shrink-0 font-mono text-xs font-semibold",
                    sub.completed ? "text-slate-400" : "text-indigo-600",
                  )}
                >
                  {hierarchyLabel}
                </span>
                <p
                  className={cn(
                    "min-w-0 flex-1 text-sm font-medium",
                    sub.completed ? "text-slate-400 line-through" : "text-slate-900",
                  )}
                >
                  {sub.title}
                </p>
              </div>
              {sub.description?.trim() && (
                <p
                  className={cn(
                    "mt-2 whitespace-pre-wrap text-sm leading-relaxed",
                    sub.completed ? "text-slate-400" : "text-slate-600",
                  )}
                >
                  {sub.description}
                </p>
              )}
              {linkLabel && (
                <p
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-xs",
                    sub.completed ? "text-slate-400" : "text-indigo-600",
                  )}
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" />
                  Linked to {linkLabel}
                </p>
              )}
            </div>
          </label>
        </div>
      </div>
      {sub.subtasks && sub.subtasks.length > 0 && (
        <DetailSubtaskGroup
          parentId={sub.id}
          subtasks={sub.subtasks}
          hierarchyIndex={hierarchyIndex}
          depth={depth + 1}
          onToggleSubtask={onToggleSubtask}
          togglingSubtaskId={togglingSubtaskId}
        />
      )}
    </li>
  );
}

function DetailSubtaskGroup({
  parentId,
  subtasks,
  hierarchyIndex,
  depth,
  onToggleSubtask,
  togglingSubtaskId,
}: {
  parentId: string;
  subtasks: SubTask[];
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  depth: number;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
  togglingSubtaskId?: string | null;
}) {
  const items = sortedSubtaskList(subtasks);
  const sortableIds = useMemo(
    () => items.map((sub) => panelSubtaskSortId(parentId, sub.id)),
    [items, parentId],
  );

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      <ul
        className={cn(
          "space-y-2",
          depth > 0 && "ml-4 border-l-2 border-slate-100 pl-3",
        )}
      >
        {items.map((sub) => (
          <DetailSubtaskRow
            key={sub.id}
            parentId={parentId}
            sub={sub}
            hierarchyIndex={hierarchyIndex}
            depth={depth}
            onToggleSubtask={onToggleSubtask}
            togglingSubtaskId={togglingSubtaskId}
          />
        ))}
      </ul>
    </SortableContext>
  );
}

function DetailSubtaskList({
  task,
  hierarchyIndex,
  onToggleSubtask,
  togglingSubtaskId,
}: {
  task: Task;
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
  togglingSubtaskId?: string | null;
}) {
  const total = countAllSubtasks(task);
  const completedCount = countCompletedSubtasks(task);

  if (total === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Subtasks</h3>
        <span className="text-xs text-slate-400">
          {completedCount}/{total} done
        </span>
      </div>
      <DetailSubtaskGroup
        parentId={task.id}
        subtasks={task.subtasks ?? []}
        hierarchyIndex={hierarchyIndex}
        depth={0}
        onToggleSubtask={onToggleSubtask}
        togglingSubtaskId={togglingSubtaskId}
      />
    </section>
  );
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  hierarchyIndex,
  onEdit,
  onFollowup,
  onToggleSubtask,
  togglingSubtaskId,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  onEdit?: (task: Task) => void;
  onFollowup?: (task: Task) => void;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
  togglingSubtaskId?: string | null;
}) {
  if (!task) return null;

  const mainLabel = hierarchyIndex.get(task.id)?.label;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <div className="flex flex-wrap items-center gap-2">
            {mainLabel && (
              <span className="font-mono text-sm font-semibold text-slate-400">
                #{mainLabel}
              </span>
            )}
            <Badge variant="secondary" className="capitalize">
              {statusFlowLabel(task.status)}
            </Badge>
            <DetailTimer task={task} />
          </div>
          <SheetTitle className="mt-3 pr-2">{task.title}</SheetTitle>
        </SheetHeader>

        <SheetBody className="space-y-8">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MetaItem label="Assignee">
              {task.assigneeName ?? (
                <span className="text-slate-400">Unassigned</span>
              )}
            </MetaItem>
            <MetaItem label="Story points">
              {task.storyPoints != null ? (
                <span className="font-medium">{task.storyPoints}</span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </MetaItem>
            <MetaItem label="Status">{statusFlowLabel(task.status)}</MetaItem>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Description</h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <ProseBlock text={task.description} />
            </div>
          </section>

          <DetailSubtaskList
            task={task}
            hierarchyIndex={hierarchyIndex}
            onToggleSubtask={onToggleSubtask}
            togglingSubtaskId={togglingSubtaskId}
          />
        </SheetBody>

        {(onEdit || onFollowup) && (
          <SheetFooter className="gap-2 sm:justify-end">
            {onFollowup && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => onFollowup(task)}
              >
                <ClipboardList className="h-4 w-4" />
                Task follow-up
              </Button>
            )}
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  onEdit(task);
                  onOpenChange(false);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit task
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
