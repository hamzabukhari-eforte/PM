"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  Board,
  BoardColumn,
  CreateTaskInput,
  ProjectMember,
  Task,
  UpdateTaskInput,
} from "@/lib/api/types";
import type { CreateTaskFormData } from "@/components/tasks/create-task-form";
import type { AssigneeFilter } from "@/components/kanban/board-assignee-filter";
import { matchesAssigneeFilter } from "@/lib/utils/task-assignees";
import { useKanbanBoardMutations } from "@/lib/hooks/use-kanban-board-mutations";
import {
  buildLinkTargets,
  buildSubtaskLookup,
  buildTaskHierarchyIndex,
  findMainTaskIdForParent,
  formSubtasksToCreateInput,
  parseAnySubtaskSortId,
  reorderSubtasksAtParent,
  updateSubtaskInTree,
} from "@/lib/utils/task-hierarchy";
import { canMoveTaskToColumn } from "@/lib/utils/task-status-flow";
import {
  findColumnId,
  sortBoardColumns,
} from "@/lib/utils/kanban-board-utils";
import { mapFormSubtasksToPayload } from "@/lib/utils/kanban-subtask-payload";
import type { DragCancelEvent, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";

export function useKanbanBoard(
  board: Board,
  projectId: string,
  sprintId: string,
  members: ProjectMember[],
  currentUserId: string | undefined,
) {
  const { updateMutation, createMutation } = useKanbanBoardMutations(projectId, sprintId);
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

  const filteredBoard = useMemo(
    () => ({
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) =>
          matchesAssigneeFilter(t.assigneeIds, assigneeFilter, currentUserId),
        ),
      })),
    }),
    [board, assigneeFilter, currentUserId],
  );

  const displayColumns = useMemo(
    () => sortBoardColumns(filteredBoard.columns),
    [filteredBoard],
  );

  const [dragColumns, setDragColumns] = useState(displayColumns);

  useEffect(() => {
    if (!isDraggingRef.current) setDragColumns(displayColumns);
  }, [displayColumns]);

  useEffect(() => {
    dragColumnsRef.current = dragColumns;
  }, [dragColumns]);

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

  function buildSubtasksPayload(
    subtasks: CreateTaskFormData["subtasks"],
    existingTask?: Task | null,
  ) {
    if (!subtasks) return undefined;
    const existingById = existingTask ? buildSubtaskLookup(existingTask) : new Map();
    return mapFormSubtasksToPayload(subtasks, existingById, members);
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

  return {
    activeTask,
    editingTask,
    setEditingTask,
    detailTask,
    followupTask,
    setFollowupTask,
    togglingSubtaskId,
    assigneeFilter,
    setAssigneeFilter,
    dragColumns,
    hierarchyIndex,
    linkTargets,
    selectedTask,
    setSelectedTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleCreateTask,
    handleArchiveTask,
    handleEditTask,
    handleToggleSubtask,
    createMutation,
    updateMutation,
  };
}
