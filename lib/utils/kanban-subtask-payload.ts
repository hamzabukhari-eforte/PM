import type { ProjectMember, SubTask } from "@/lib/api/types";
import type { SubtaskFormItem } from "@/lib/utils/task-hierarchy";
import { resolveAssignees } from "@/lib/utils/task-assignees";

export function mapFormSubtasksToPayload(
  subtasks: SubtaskFormItem[],
  existingById: Map<string, SubTask>,
  members: ProjectMember[],
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
        ? mapFormSubtasksToPayload(sub.subtasks, existingById, members)
        : [],
    };
  });
}
