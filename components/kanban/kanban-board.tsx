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
import type { Board, CreateTaskInput, ProjectMember, SubTask, Task, UpdateTaskInput } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { TaskDetailSheet } from "@/components/kanban/task-detail-sheet";
import {
  BoardAssigneeFilter,
  matchesAssigneeFilter,
  type AssigneeFilter,
} from "@/components/kanban/board-assignee-filter";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import type { CreateTaskFormData } from "@/components/tasks/create-task-form";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canArchiveTasks } from "@/lib/utils/roles";
import {
  buildLinkTargets,
  buildSubtaskLookup,
  buildTaskHierarchyIndex,
  findMainTaskIdForParent,
  formSubtasksToCreateInput,
  parseAnySubtaskSortId,
  reorderSubtasksAtParent,
  updateSubtaskInTree,
  type SubtaskFormItem,
} from "@/lib/utils/task-hierarchy";
import { canMoveTaskToColumn } from "@/lib/utils/task-status-flow";

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
  const userRole = useAuthStore((s) => s.user?.role);
  const canArchive = canArchiveTasks(userRole);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [togglingSubtaskId, setTogglingSubtaskId] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");

  const hierarchyIndex = useMemo(() => buildTaskHierarchyIndex(board), [board]);
  const linkTargets = useMemo(() => buildLinkTargets(board), [board]);

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

  const updateMutation = useMutation({
    mutationFn: (payload: { taskId: string; body: UpdateTaskInput }) =>
      apiClient(endpoints.tasks.update(payload.taskId), {
        method: "PATCH",
        body: JSON.stringify(payload.body),
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

  function findTaskById(id: string): Task | null {
    for (const col of board.columns) {
      const task = col.tasks.find((t) => t.id === id);
      if (task) return task;
    }
    return null;
  }

  const detailTask = useMemo(() => {
    if (!selectedTask) return null;
    return findTaskById(selectedTask.id) ?? selectedTask;
  }, [selectedTask, board]);

  function findTask(id: string): { task: Task; columnId: string } | null {
    for (const col of board.columns) {
      const task = col.tasks.find((t) => t.id === id);
      if (task) return { task, columnId: col.id };
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    if (activeId.startsWith("sub:") || activeId.startsWith("panel-sub:")) return;
    const found = findTask(activeId);
    if (found) setActiveTask(found.task);
  }

  function handleSubtaskDrag(activeId: string, overId: string) {
    const activeSub = parseAnySubtaskSortId(activeId);
    const overSub = parseAnySubtaskSortId(overId);
    if (!activeSub || !overSub) return;
    if (activeSub.parentId !== overSub.parentId) return;

    const mainTaskId = findMainTaskIdForParent(board, activeSub.parentId);
    if (!mainTaskId) return;

    const found = findTask(mainTaskId);
    if (!found) return;

    const reordered = reorderSubtasksAtParent(
      found.task.subtasks ?? [],
      activeSub.parentId,
      mainTaskId,
      activeSub.subtaskId,
      overSub.subtaskId,
    );

    updateMutation.mutate({
      taskId: found.task.id,
      body: { subtasks: reordered },
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("sub:") || activeId.startsWith("panel-sub:")) {
      handleSubtaskDrag(activeId, overId);
      return;
    }

    const activeFound = findTask(activeId);
    if (!activeFound) return;

    let targetColumnId = overId;
    const overTask = findTask(overId);
    if (overTask) targetColumnId = overTask.columnId;

    const targetCol = board.columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;
    if (activeFound.columnId === targetColumnId && activeId === overId) return;

    if (!canMoveTaskToColumn(activeFound.columnId, targetColumnId)) return;

    const order = overTask ? overTask.task.order : targetCol.tasks.length;

    updateMutation.mutate({
      taskId: activeId,
      body: { columnId: targetColumnId, order },
    });
  }

  function mapFormSubtasks(
    subtasks: SubtaskFormItem[],
    existingById: Map<string, SubTask>,
  ): SubTask[] {
    return subtasks.map((sub, index) => {
      const existing = sub.id ? existingById.get(sub.id) : undefined;
      return {
        id: sub.id ?? `st-${Date.now()}-${index}`,
        title: sub.title,
        description: sub.description ?? "",
        order: index,
        linkedTaskId: sub.linkedTaskId ?? null,
        completed: existing?.completed ?? false,
        subtasks: sub.subtasks?.length
          ? mapFormSubtasks(sub.subtasks, existingById)
          : [],
      };
    });
  }

  function buildSubtasksPayload(
    subtasks: CreateTaskFormData["subtasks"],
    existingTask?: Task | null,
  ): SubTask[] | undefined {
    if (!subtasks) return undefined;
    const existingById = existingTask ? buildSubtaskLookup(existingTask) : new Map();
    return mapFormSubtasks(subtasks, existingById);
  }

  function handleToggleSubtask(subtaskId: string, completed: boolean) {
    if (!detailTask) return;
    setTogglingSubtaskId(subtaskId);
    const updated = updateSubtaskInTree(detailTask.subtasks ?? [], subtaskId, (sub) => ({
      ...sub,
      completed,
    }));
    updateMutation.mutate(
      { taskId: detailTask.id, body: { subtasks: updated } },
      { onSettled: () => setTogglingSubtaskId(null) },
    );
  }

  function handleEditTask(taskId: string, data: CreateTaskFormData) {
    const body: UpdateTaskInput = {
      title: data.title,
      description: data.description ?? "",
      assigneeId: data.assigneeId ?? null,
      storyPoints: data.storyPoints ? Number(data.storyPoints) : null,
      subtasks: buildSubtasksPayload(data.subtasks, findTaskById(taskId)),
    };
    updateMutation.mutate(
      { taskId, body },
      { onSuccess: () => setEditingTask(null) },
    );
  }

  function handleArchiveTask(task: Task) {
    updateMutation.mutate({ taskId: task.id, body: { archived: true } });
  }

  function handleCreateTask(columnId: string, data: CreateTaskFormData) {
    const payload: CreateTaskInput = {
      title: data.title,
      description: data.description,
      columnId,
      assigneeId: data.assigneeId ?? null,
      storyPoints: data.storyPoints ? Number(data.storyPoints) : null,
      kind: "project",
      subtasks: data.subtasks?.length ? formSubtasksToCreateInput(data.subtasks) : undefined,
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
                linkTargets={linkTargets}
                hierarchyIndex={hierarchyIndex}
                onCreateTask={handleCreateTask}
                onEditTask={setEditingTask}
                onOpenTask={setSelectedTask}
                onArchiveTask={canArchive ? handleArchiveTask : undefined}
                canArchive={canArchive}
                creating={createMutation.isPending}
              />
            ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <KanbanCard
              task={activeTask}
              hierarchyIndex={hierarchyIndex}
              isDragging
            />
          ) : null}
        </DragOverlay>

        <TaskDetailSheet
          task={detailTask}
          open={!!detailTask}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
          hierarchyIndex={hierarchyIndex}
          onEdit={setEditingTask}
          onToggleSubtask={handleToggleSubtask}
          togglingSubtaskId={togglingSubtaskId}
        />
      </DndContext>

      <EditTaskDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        members={members}
        linkTargets={linkTargets}
        onSubmit={handleEditTask}
        loading={updateMutation.isPending}
      />

    </div>
  );
}
