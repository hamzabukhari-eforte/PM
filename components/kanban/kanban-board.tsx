"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Board, BoardColumn, CreateTaskInput, ProjectMember, SubTask, Task, UpdateTaskInput } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { TaskDetailSheet } from "@/components/kanban/task-detail-sheet";
import { TaskFollowupSheet } from "@/components/followup/task-followup-sheet";
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
import { resolveAssignees } from "@/lib/utils/task-assignees";

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCorners(args);
};

function findColumnId(columns: BoardColumn[], taskOrColumnId: string): string | null {
  if (columns.some((column) => column.id === taskOrColumnId)) return taskOrColumnId;
  for (const column of columns) {
    if (column.tasks.some((task) => task.id === taskOrColumnId)) return column.id;
  }
  return null;
}

function sortBoardColumns(columns: BoardColumn[]): BoardColumn[] {
  return columns
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((column) => ({
      ...column,
      tasks: column.tasks.slice().sort((a, b) => a.order - b.order),
    }));
}

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
  const [followupTask, setFollowupTask] = useState<Task | null>(null);
  const [togglingSubtaskId, setTogglingSubtaskId] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");
  const isDraggingRef = useRef(false);
  const dragColumnsRef = useRef<BoardColumn[]>([]);

  const hierarchyIndex = useMemo(() => buildTaskHierarchyIndex(board), [board]);
  const linkTargets = useMemo(() => buildLinkTargets(board), [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );

  const filteredBoard = useMemo(() => {
    return {
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) =>
          matchesAssigneeFilter(t.assigneeIds, assigneeFilter, currentUserId),
        ),
      })),
    };
  }, [board, assigneeFilter, currentUserId]);

  const displayColumns = useMemo(
    () => sortBoardColumns(filteredBoard.columns),
    [filteredBoard],
  );

  const [dragColumns, setDragColumns] = useState(displayColumns);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setDragColumns(displayColumns);
    }
  }, [displayColumns]);

  useEffect(() => {
    dragColumnsRef.current = dragColumns;
  }, [dragColumns]);

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
    isDraggingRef.current = true;
    const activeId = String(event.active.id);
    if (activeId.startsWith("sub:") || activeId.startsWith("panel-sub:")) return;
    const found = findTask(activeId);
    if (found) setActiveTask(found.task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    if (activeId.startsWith("sub:") || activeId.startsWith("panel-sub:")) return;

    const overId = String(over.id);
    const activeColumnId = findColumnId(dragColumnsRef.current, activeId);
    const overColumnId = findColumnId(dragColumnsRef.current, overId);

    if (!activeColumnId || !overColumnId) return;
    if (!canMoveTaskToColumn(activeColumnId, overColumnId)) return;

    // Only reorder within the same column while dragging — cross-column moves on drop.
    // Moving the sortable node between columns during drag breaks DragOverlay positioning.
    if (activeColumnId !== overColumnId) return;

    setDragColumns((columns) => {
      const activeColIdx = columns.findIndex((column) => column.id === activeColumnId);
      const overCol = columns[activeColIdx];
      const activeTaskIdx = overCol.tasks.findIndex((task) => task.id === activeId);
      if (activeTaskIdx === -1) return columns;

      const overTaskIdx = overCol.tasks.findIndex((task) => task.id === overId);
      if (overTaskIdx === -1 || activeTaskIdx === overTaskIdx) return columns;

      return columns.map((column, idx) =>
        idx === activeColIdx
          ? { ...column, tasks: arrayMove(column.tasks, activeTaskIdx, overTaskIdx) }
          : column,
      );
    });
  }

  function resetDragState() {
    isDraggingRef.current = false;
    setActiveTask(null);
    setDragColumns(displayColumns);
  }

  function resolveMainTaskDropTarget(
    overId: string,
  ): { columnId: string; overTask: Task | null } | null {
    const overSub = parseAnySubtaskSortId(overId);
    if (overSub) {
      const mainTaskId = findMainTaskIdForParent(board, overSub.parentId);
      if (!mainTaskId) return null;
      const found = findTask(mainTaskId);
      if (!found) return null;
      return { columnId: found.columnId, overTask: found.task };
    }

    const overTask = findTask(overId);
    if (overTask) return { columnId: overTask.columnId, overTask: overTask.task };

    const col = board.columns.find((c) => c.id === overId);
    if (col) return { columnId: col.id, overTask: null };

    return null;
  }

  function persistMainTaskMove(taskId: string, overId: string) {
    const original = findTask(taskId);
    if (!original) return;

    const dropTarget = resolveMainTaskDropTarget(overId);
    if (!dropTarget) return;

    const { columnId: targetColumnId, overTask } = dropTarget;

    if (!canMoveTaskToColumn(original.columnId, targetColumnId)) {
      setDragColumns(displayColumns);
      return;
    }

    const targetCol = board.columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;

    const sorted = targetCol.tasks.slice().sort((a, b) => a.order - b.order);
    const oldIndex = sorted.findIndex((t) => t.id === taskId);

    let newIndex: number;
    if (overTask && overTask.id !== taskId) {
      newIndex = sorted.findIndex((t) => t.id === overTask.id);
    } else {
      newIndex = Math.max(
        0,
        sorted.length - (original.columnId === targetColumnId ? 1 : 0),
      );
    }

    if (newIndex === -1) return;
    if (original.columnId === targetColumnId && oldIndex === newIndex) return;

    if (original.columnId === targetColumnId) {
      updateMutation.mutate({ taskId, body: { order: newIndex } });
      return;
    }

    updateMutation.mutate({
      taskId,
      body: { columnId: targetColumnId, order: newIndex },
    });
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
    const { active, over } = event;
    const activeId = String(active.id);

    if (activeId.startsWith("sub:") || activeId.startsWith("panel-sub:")) {
      isDraggingRef.current = false;
      setActiveTask(null);
      if (over) handleSubtaskDrag(activeId, String(over.id));
      return;
    }

    isDraggingRef.current = false;
    setActiveTask(null);

    if (!over) {
      setDragColumns(displayColumns);
      return;
    }

    persistMainTaskMove(activeId, String(over.id));
  }

  function handleDragCancel(_event: DragCancelEvent) {
    resetDragState();
  }

  function mapFormSubtasks(
    subtasks: SubtaskFormItem[],
    existingById: Map<string, SubTask>,
  ): SubTask[] {
    return subtasks.map((sub, index) => {
      const existing = sub.id ? existingById.get(sub.id) : undefined;
      const assigneeIds = sub.assigneeIds ?? existing?.assigneeIds ?? [];
      const { assigneeNames } = resolveAssignees(assigneeIds, members);
      return {
        id: sub.id ?? `st-${Date.now()}-${index}`,
        title: sub.title,
        description: sub.description ?? "",
        order: index,
        linkedTaskId: sub.linkedTaskId ?? null,
        completed: existing?.completed ?? false,
        assigneeIds,
        assigneeNames,
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
      assigneeIds: data.assigneeIds ?? [],
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
      assigneeIds: data.assigneeIds ?? [],
      storyPoints: data.storyPoints ? Number(data.storyPoints) : null,
      kind: "project",
      subtasks: data.subtasks?.length ? formSubtasksToCreateInput(data.subtasks) : undefined,
    };
    createMutation.mutate(payload);
  }

  return (
    <div className="min-w-0 space-y-5">
      <BoardAssigneeFilter
        members={members}
        currentUserId={currentUserId}
        value={assigneeFilter}
        onChange={setAssigneeFilter}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="w-full min-w-0 overflow-x-hidden">
          <div className="scrollbar-hidden -mx-6 flex w-full min-w-0 gap-4 overflow-x-auto overscroll-x-contain px-6 pb-1 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
            {dragColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                draggingTaskId={activeTask?.id}
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
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1)",
          }}
        >
          {activeTask ? (
            <KanbanCard
              task={activeTask}
              hierarchyIndex={hierarchyIndex}
              overlay
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
          onFollowup={(task) => {
            setFollowupTask(task);
          }}
          onToggleSubtask={handleToggleSubtask}
          togglingSubtaskId={togglingSubtaskId}
        />

        <TaskFollowupSheet
          task={followupTask}
          open={!!followupTask}
          onOpenChange={(open) => {
            if (!open) setFollowupTask(null);
          }}
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
