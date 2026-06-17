import type { RecurrenceInterval, Task, TaskKind, TaskStatus } from "@/lib/api/types";

export function statusFromColumnId(columnId: string): TaskStatus {
  if (columnId.includes("done")) return "done";
  if (columnId.includes("progress")) return "in_progress";
  if (columnId.includes("review")) return "review";
  return "todo";
}

export function createBaseTask(
  partial: Pick<Task, "id" | "title"> &
    Partial<Omit<Task, "id" | "title">>,
): Task {
  return {
    kind: "project",
    projectId: null,
    sprintId: null,
    columnId: null,
    description: "",
    status: "todo",
    order: 0,
    assigneeId: null,
    assigneeName: null,
    storyPoints: null,
    timeInProgressSeconds: 0,
    inProgressSince: null,
    recurrenceInterval: null,
    nextReminderAt: null,
    timelineStart: null,
    timelineEnd: null,
    ...partial,
  };
}

export function createProjectTask(
  id: string,
  projectId: string,
  sprintId: string,
  columnId: string,
  title: string,
  status: TaskStatus,
  order: number,
  assigneeId: string | null,
  assigneeName: string | null,
  storyPoints: number | null,
  extras?: Partial<Task>,
): Task {
  return createBaseTask({
    id,
    kind: "project",
    projectId,
    sprintId,
    columnId,
    title,
    status,
    order,
    assigneeId,
    assigneeName,
    storyPoints,
    inProgressSince: status === "in_progress" ? new Date(Date.now() - 3600000).toISOString() : null,
    timeInProgressSeconds: status === "review" ? 5400 : 0,
    ...extras,
  });
}

export function createPersonalTask(
  id: string,
  kind: Extract<TaskKind, "miscellaneous" | "routine">,
  title: string,
  status: TaskStatus,
  assigneeId: string,
  assigneeName: string,
  recurrenceInterval?: RecurrenceInterval,
  storyPoints?: number | null,
  timelineStart?: string | null,
  timelineEnd?: string | null,
): Task {
  const nextReminderAt =
    kind === "routine" && recurrenceInterval
      ? new Date(Date.now() + 86400000).toISOString()
      : null;

  return createBaseTask({
    id,
    kind,
    title,
    status,
    assigneeId,
    assigneeName,
    storyPoints: storyPoints ?? null,
    recurrenceInterval: kind === "routine" ? recurrenceInterval ?? "week" : null,
    nextReminderAt,
    timelineStart: timelineStart ?? null,
    timelineEnd: timelineEnd ?? null,
    inProgressSince: null,
    timeInProgressSeconds: 0,
  });
}
