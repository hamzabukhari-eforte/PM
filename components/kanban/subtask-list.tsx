"use client";

import { useMemo } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Link2 } from "lucide-react";
import type { SubTask, Task } from "@/lib/api/types";
import {
  formatHierarchyLabel,
  sortedSubtaskList,
  subtaskSortId,
  type TaskHierarchyEntry,
} from "@/lib/utils/task-hierarchy";
import { cn } from "@/lib/utils";

function SubtaskRow({
  parentId,
  subtask,
  hierarchyIndex,
  depth,
}: {
  parentId: string;
  subtask: SubTask;
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  depth: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtaskSortId(parentId, subtask.id) });

  const hierarchyLabel = hierarchyIndex.get(subtask.id)?.label ?? "?";
  const linkLabel = subtask.linkedTaskId
    ? formatHierarchyLabel(hierarchyIndex, subtask.linkedTaskId)
    : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="space-y-1">
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-start gap-1.5 rounded-md border border-slate-100 bg-slate-50/80 px-2 py-1.5",
          isDragging && "opacity-60 ring-2 ring-blue-100",
        )}
      >
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${subtask.title}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-snug text-slate-700">
            <span className="font-mono font-medium text-slate-500">{hierarchyLabel}</span>{" "}
            {subtask.title}
          </p>
          {linkLabel && (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-indigo-600">
              <Link2 className="h-3 w-3 shrink-0" />
              <span className="truncate">→ {linkLabel}</span>
            </p>
          )}
        </div>
      </div>
      {subtask.subtasks && subtask.subtasks.length > 0 && (
        <SubtaskTree
          parentId={subtask.id}
          subtasks={subtask.subtasks}
          hierarchyIndex={hierarchyIndex}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

function SubtaskTree({
  parentId,
  subtasks,
  hierarchyIndex,
  depth,
}: {
  parentId: string;
  subtasks: SubTask[];
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  depth: number;
}) {
  const items = sortedSubtaskList(subtasks);
  const sortableIds = useMemo(
    () => items.map((sub) => subtaskSortId(parentId, sub.id)),
    [items, parentId],
  );

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      <div
        className={cn("space-y-1", depth > 0 && "ml-3 border-l border-slate-200 pl-2")}
      >
        {items.map((sub) => (
          <SubtaskRow
            key={sub.id}
            parentId={parentId}
            subtask={sub}
            hierarchyIndex={hierarchyIndex}
            depth={depth}
          />
        ))}
      </div>
    </SortableContext>
  );
}

export function SubtaskList({
  task,
  hierarchyIndex,
}: {
  task: Task;
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
}) {
  const subtasks = sortedSubtaskList(task.subtasks);
  if (subtasks.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        Subtasks
      </p>
      <SubtaskTree
        parentId={task.id}
        subtasks={subtasks}
        hierarchyIndex={hierarchyIndex}
        depth={0}
      />
    </div>
  );
}
