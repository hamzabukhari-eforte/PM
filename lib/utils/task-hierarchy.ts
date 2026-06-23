import type { Board, CreateSubTaskInput, SubTask, Task } from "@/lib/api/types";

export type TaskHierarchyEntry = {
  id: string;
  label: string;
  kind: "main" | "sub";
  mainTaskId: string;
  title: string;
  depth: number;
};

export type LinkTarget = {
  id: string;
  label: string;
};

export type SubtaskFormItem = {
  id?: string;
  title: string;
  description?: string;
  linkedTaskId?: string;
  assigneeIds?: string[];
  subtasks?: SubtaskFormItem[];
};

export function sortedSubtaskList(subtasks: SubTask[] | undefined): SubTask[] {
  return (subtasks ?? []).slice().sort((a, b) => a.order - b.order);
}

export function sortedSubtasks(task: Task | { subtasks?: SubTask[] }): SubTask[] {
  return sortedSubtaskList(task.subtasks);
}

export function walkSubtasks(
  subtasks: SubTask[] | undefined,
  visitor: (sub: SubTask, parentId: string, depth: number) => void,
  parentId: string,
  depth = 0,
): void {
  for (const sub of sortedSubtaskList(subtasks)) {
    visitor(sub, parentId, depth);
    walkSubtasks(sub.subtasks, visitor, sub.id, depth + 1);
  }
}

export function countAllSubtasks(task: Task): number {
  let count = 0;
  walkSubtasks(task.subtasks, () => {
    count += 1;
  }, task.id);
  return count;
}

export function countCompletedSubtasks(task: Task): number {
  let count = 0;
  walkSubtasks(task.subtasks, (sub) => {
    if (sub.completed) count += 1;
  }, task.id);
  return count;
}

export function buildSubtaskLookup(task: Task): Map<string, SubTask> {
  const lookup = new Map<string, SubTask>();
  walkSubtasks(task.subtasks, (sub) => {
    lookup.set(sub.id, sub);
  }, task.id);
  return lookup;
}

function indexSubtaskTree(
  subtasks: SubTask[],
  prefix: string,
  mainTaskId: string,
  index: Map<string, TaskHierarchyEntry>,
  depth: number,
): void {
  sortedSubtaskList(subtasks).forEach((sub, subIdx) => {
    const label = `${prefix}.${subIdx + 1}`;
    index.set(sub.id, {
      id: sub.id,
      label,
      kind: "sub",
      mainTaskId,
      title: sub.title,
      depth,
    });
    if (sub.subtasks?.length) {
      indexSubtaskTree(sub.subtasks, label, mainTaskId, index, depth + 1);
    }
  });
}

/** Sprint-wide task index with unlimited subtask nesting (1, 1.1, 1.1.1, …). */
export function buildTaskHierarchyIndex(board: Board): Map<string, TaskHierarchyEntry> {
  const index = new Map<string, TaskHierarchyEntry>();
  const mainTasks = listMainTasks(board);

  mainTasks.forEach((task, mainIdx) => {
    const mainNum = mainIdx + 1;
    index.set(task.id, {
      id: task.id,
      label: `${mainNum}`,
      kind: "main",
      mainTaskId: task.id,
      title: task.title,
      depth: 0,
    });

    indexSubtaskTree(task.subtasks ?? [], `${mainNum}`, task.id, index, 1);
  });

  return index;
}

export function listMainTasks(board: Board): Task[] {
  return board.columns
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((col) => col.tasks.slice().sort((a, b) => a.order - b.order));
}

export function formatHierarchyLabel(
  index: Map<string, TaskHierarchyEntry>,
  id: string,
  fallbackTitle?: string,
): string {
  const entry = index.get(id);
  if (!entry) return fallbackTitle ?? id;
  return `${entry.label}: ${entry.title}`;
}

export function buildLinkTargets(
  board: Board,
  options?: { excludeSubtaskIds?: string[] },
): LinkTarget[] {
  const index = buildTaskHierarchyIndex(board);
  const exclude = new Set(options?.excludeSubtaskIds ?? []);

  return [...index.values()]
    .filter((entry) => !exclude.has(entry.id))
    .map((entry) => ({
      id: entry.id,
      label: `${entry.label} — ${entry.title}`,
    }));
}

export function subtaskSortId(parentId: string, subtaskId: string) {
  return `sub:${parentId}:${subtaskId}`;
}

export function panelSubtaskSortId(parentId: string, subtaskId: string) {
  return `panel-sub:${parentId}:${subtaskId}`;
}

function parsePrefixedSubtaskSortId(
  id: string,
  prefix: string,
): { parentId: string; subtaskId: string } | null {
  if (!id.startsWith(`${prefix}:`)) return null;
  const [, parentId, subtaskId] = id.split(":");
  if (!parentId || !subtaskId) return null;
  return { parentId, subtaskId };
}

export function parseSubtaskSortId(id: string): { parentId: string; subtaskId: string } | null {
  return parsePrefixedSubtaskSortId(id, "sub");
}

export function parsePanelSubtaskSortId(
  id: string,
): { parentId: string; subtaskId: string } | null {
  return parsePrefixedSubtaskSortId(id, "panel-sub");
}

export function parseAnySubtaskSortId(
  id: string,
): { parentId: string; subtaskId: string } | null {
  return parseSubtaskSortId(id) ?? parsePanelSubtaskSortId(id);
}

export function collectSubtaskSortableIds(task: Task): string[] {
  const ids: string[] = [];
  walkSubtasks(
    task.subtasks,
    (sub, parentId) => {
      ids.push(subtaskSortId(parentId, sub.id));
    },
    task.id,
  );
  return ids;
}

export function collectPanelSubtaskSortableIds(task: Task): string[] {
  const ids: string[] = [];
  walkSubtasks(
    task.subtasks,
    (sub, parentId) => {
      ids.push(panelSubtaskSortId(parentId, sub.id));
    },
    task.id,
  );
  return ids;
}

function reorderSiblings(
  siblings: SubTask[],
  activeId: string,
  overId: string,
): SubTask[] {
  const sorted = sortedSubtaskList(siblings);
  const oldIndex = sorted.findIndex((s) => s.id === activeId);
  const newIndex = sorted.findIndex((s) => s.id === overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return sorted;

  const next = [...sorted];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);

  return next.map((sub, order) => ({ ...sub, order }));
}

export function reorderSubtasksAtParent(
  subtasks: SubTask[],
  parentId: string,
  mainTaskId: string,
  activeSubtaskId: string,
  overSubtaskId: string,
): SubTask[] {
  if (parentId === mainTaskId) {
    return reorderSiblings(subtasks, activeSubtaskId, overSubtaskId);
  }

  return subtasks.map((sub) => {
    if (sub.id === parentId) {
      return {
        ...sub,
        subtasks: reorderSiblings(sub.subtasks ?? [], activeSubtaskId, overSubtaskId),
      };
    }
    if (sub.subtasks?.length) {
      return {
        ...sub,
        subtasks: reorderSubtasksAtParent(
          sub.subtasks,
          parentId,
          mainTaskId,
          activeSubtaskId,
          overSubtaskId,
        ),
      };
    }
    return sub;
  });
}

/** @deprecated Use reorderSubtasksAtParent for nested trees. */
export function reorderSubtasks(subtasks: SubTask[], activeId: string, overId: string): SubTask[] {
  return reorderSiblings(subtasks, activeId, overId);
}

export function updateSubtaskInTree(
  subtasks: SubTask[],
  subtaskId: string,
  updater: (sub: SubTask) => SubTask,
): SubTask[] {
  return subtasks.map((sub) => {
    if (sub.id === subtaskId) return updater(sub);
    if (sub.subtasks?.length) {
      return {
        ...sub,
        subtasks: updateSubtaskInTree(sub.subtasks, subtaskId, updater),
      };
    }
    return sub;
  });
}

export function subtasksToFormData(subtasks: SubTask[] | undefined): SubtaskFormItem[] {
  return sortedSubtaskList(subtasks).map((sub) => ({
    id: sub.id,
    title: sub.title,
    description: sub.description,
    linkedTaskId: sub.linkedTaskId ?? undefined,
    assigneeIds: sub.assigneeIds?.length ? [...sub.assigneeIds] : [],
    subtasks: sub.subtasks?.length ? subtasksToFormData(sub.subtasks) : [],
  }));
}

export function formSubtasksToCreateInput(subtasks: SubtaskFormItem[]): CreateSubTaskInput[] {
  return subtasks.map((sub) => ({
    title: sub.title,
    description: sub.description,
    linkedTaskId: sub.linkedTaskId ?? null,
    assigneeIds: sub.assigneeIds?.length ? sub.assigneeIds : undefined,
    subtasks: sub.subtasks?.length ? formSubtasksToCreateInput(sub.subtasks) : undefined,
  }));
}

export function findMainTaskIdForParent(board: Board, parentId: string): string | null {
  for (const col of board.columns) {
    for (const task of col.tasks) {
      if (task.id === parentId) return task.id;
      let found = false;
      walkSubtasks(task.subtasks, (sub) => {
        if (sub.id === parentId) found = true;
      }, task.id);
      if (found) return task.id;
    }
  }
  return null;
}
