import { z } from "zod";
import type { SubtaskFormItem } from "@/lib/utils/task-hierarchy";

const subtaskSchema: z.ZodType<SubtaskFormItem> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Subtask title is required"),
    description: z.string().optional(),
    linkedTaskId: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
    subtasks: z.array(subtaskSchema).optional(),
  }),
);

export const createTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  storyPoints: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  subtasks: z.array(subtaskSchema).optional(),
});

export type CreateTaskFormData = {
  title: string;
  description?: string;
  storyPoints?: string;
  assigneeIds?: string[];
  subtasks?: SubtaskFormItem[];
};

export function filterSubtasks(
  subtasks: SubtaskFormItem[] | undefined,
): SubtaskFormItem[] | undefined {
  if (!subtasks) return undefined;
  return subtasks
    .filter((sub) => sub.title.trim())
    .map((sub) => ({
      ...sub,
      subtasks: filterSubtasks(sub.subtasks),
    }));
}
