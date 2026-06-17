"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Board, CreateTaskInput, ProjectMember, Task } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import {
  BoardAssigneeFilter,
  matchesAssigneeFilter,
  type AssigneeFilter,
} from "@/components/kanban/board-assignee-filter";
import type { CreateTaskFormData } from "@/components/tasks/create-task-form";
import { useAuthStore } from "@/lib/stores/auth-store";

export function KanbanBoard({
  board,
  projectId,
  sprintId,
  members,
}: {
  board: Board;
  projectId: string;
  sprintId: string;
  members: ProjectMember[];
}) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filteredBoard = useMemo(() => {
    return {
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) =>
          matchesAssigneeFilter(t.assigneeId, assigneeFilter, currentUserId),
        ),
      })),
    };
  }, [board, assigneeFilter, currentUserId]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["board", projectId, sprintId] });
    void queryClient.invalidateQueries({ queryKey: ["backlog", projectId, sprintId] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const moveMutation = useMutation({
    mutationFn: (payload: { taskId: string; columnId: string; order: number }) =>
      apiClient(endpoints.tasks.update(payload.taskId), {
        method: "PATCH",
        body: JSON.stringify({
          columnId: payload.columnId,
          order: payload.order,
        }),
      }),
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskInput) =>
      apiClient(endpoints.projects.tasks(projectId, sprintId), {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  function findTask(id: string): { task: Task; columnId: string } | null {
    for (const col of board.columns) {
      const task = col.tasks.find((t) => t.id === id);
      if (task) return { task, columnId: col.id };
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const found = findTask(String(event.active.id));
    if (found) setActiveTask(found.task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeFound = findTask(activeId);
    if (!activeFound) return;

    let targetColumnId = overId;
    const overTask = findTask(overId);
    if (overTask) targetColumnId = overTask.columnId;

    const targetCol = board.columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;
    if (activeFound.columnId === targetColumnId && activeId === overId) return;

    const order = overTask ? overTask.task.order : targetCol.tasks.length;

    moveMutation.mutate({
      taskId: activeId,
      columnId: targetColumnId,
      order,
    });
  }

  function handleCreateTask(columnId: string, data: CreateTaskFormData) {
    const payload: CreateTaskInput = {
      title: data.title,
      description: data.description,
      columnId,
      assigneeId: data.assigneeId ?? null,
      storyPoints: data.storyPoints ? Number(data.storyPoints) : null,
      kind: "project",
    };
    createMutation.mutate(payload);
  }

  return (
    <div className="space-y-5">
      <BoardAssigneeFilter
        members={members}
        currentUserId={currentUserId}
        value={assigneeFilter}
        onChange={setAssigneeFilter}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {filteredBoard.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                members={members}
                onCreateTask={handleCreateTask}
                creating={createMutation.isPending}
              />
            ))}
        </div>
        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
