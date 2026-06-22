"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { BoardColumn, ProjectMember, Task } from "@/lib/api/types";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import type { CreateTaskFormData } from "@/components/tasks/create-task-form";
import { Button } from "@/components/ui/button";
import type { LinkTarget, TaskHierarchyEntry } from "@/lib/utils/task-hierarchy";
import { cn } from "@/lib/utils";

export function KanbanColumn({
  column,
  members,
  linkTargets,
  hierarchyIndex,
  onCreateTask,
  onEditTask,
  onOpenTask,
  onArchiveTask,
  canArchive,
  creating,
}: {
  column: BoardColumn;
  members: ProjectMember[];
  linkTargets: LinkTarget[];
  hierarchyIndex: Map<string, TaskHierarchyEntry>;
  onCreateTask: (columnId: string, data: CreateTaskFormData) => void;
  onEditTask?: (task: Task) => void;
  onOpenTask?: (task: Task) => void;
  onArchiveTask?: (task: Task) => void;
  canArchive?: boolean;
  creating?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const sortedTasks = column.tasks.slice().sort((a, b) => a.order - b.order);
  const sortableIds = sortedTasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[26rem] min-w-[22rem] shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-50/80",
        isOver && "border-indigo-200 bg-indigo-50/40 ring-2 ring-indigo-100",
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 px-4 py-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{column.name}</h3>
          <p className="text-xs text-slate-400">{column.tasks.length} tasks</p>
        </div>
        <AddTaskDialog
          members={members}
          linkTargets={linkTargets}
          columnLabel={column.name}
          onSubmit={(data) => onCreateTask(column.id, data)}
          loading={creating}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-slate-500 hover:text-indigo-600"
              title={`Add task to ${column.name}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-col gap-2 p-3">
          {sortedTasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              hierarchyIndex={hierarchyIndex}
              onOpen={onOpenTask}
              onEdit={onEditTask}
              onArchive={onArchiveTask}
              canArchive={canArchive}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
