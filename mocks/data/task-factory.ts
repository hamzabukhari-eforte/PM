import type { CreateSubTaskInput, RecurrenceInterval, SubTask, Task, TaskKind, TaskStatus } from "@/lib/api/types";
import { statusFromColumnId } from "@/lib/utils/task-status-flow";

export { statusFromColumnId };

export function mapCreateSubtasks(
  subs: CreateSubTaskInput[],
  idSeed: number | string = Date.now(),
  assigneeNamesById?: Map<string, string>,
): SubTask[] {
  return subs.map((sub, index) => {
    const assigneeIds = sub.assigneeIds ?? [];
    const assigneeNames = assigneeIds
      .map((id) => assigneeNamesById?.get(id))
      .filter((name): name is string => !!name);
    return {
      id: `st-${idSeed}-${index}`,
      title: sub.title,
      description: sub.description ?? "",
      order: index,
      linkedTaskId: sub.linkedTaskId ?? null,
      completed: false,
      assigneeIds,
      assigneeNames,
      subtasks: sub.subtasks?.length
        ? mapCreateSubtasks(sub.subtasks, `${idSeed}-${index}`, assigneeNamesById)
        : [],
    };
  });
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
    assigneeIds: [],
    assigneeNames: [],
    storyPoints: null,
    timeInProgressSeconds: 0,
    inProgressSince: null,
    recurrenceInterval: null,
    nextReminderAt: null,
    timelineStart: null,
    timelineEnd: null,
    subtasks: [],
    archived: false,
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
  assigneeIds: string[],
  assigneeNames: string[],
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
    assigneeIds,
    assigneeNames,
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
  assigneeIds: string[],
  assigneeNames: string[],
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
    assigneeIds,
    assigneeNames,
    storyPoints: storyPoints ?? null,
    recurrenceInterval: kind === "routine" ? recurrenceInterval ?? "week" : null,
    nextReminderAt,
    timelineStart: timelineStart ?? null,
    timelineEnd: timelineEnd ?? null,
    inProgressSince: null,
    timeInProgressSeconds: 0,
  });
}
