"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateTaskForm,
  type CreateTaskFormData,
} from "@/components/tasks/create-task-form";
import type { ProjectMember, Task } from "@/lib/api/types";
import type { LinkTarget } from "@/lib/utils/task-hierarchy";
import { subtasksToFormData } from "@/lib/utils/task-hierarchy";

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  members,
  linkTargets,
  onSubmit,
  loading,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: ProjectMember[];
  linkTargets: LinkTarget[];
  onSubmit: (taskId: string, data: CreateTaskFormData) => void;
  loading?: boolean;
}) {
  if (!task) return null;

  const defaultValues: CreateTaskFormData = {
    title: task.title,
    description: task.description,
    storyPoints: task.storyPoints != null ? String(task.storyPoints) : "",
    assigneeId: task.assigneeId ?? "unassigned",
    subtasks: subtasksToFormData(task.subtasks),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update details, subtasks, and links. Hierarchy numbers are recalculated automatically.
          </DialogDescription>
        </DialogHeader>
        <CreateTaskForm
          key={task.id}
          members={members}
          linkTargets={linkTargets}
          defaultValues={defaultValues}
          onSubmit={(data) => onSubmit(task.id, data)}
          onCancel={() => onOpenChange(false)}
          loading={loading}
          submitLabel="Save changes"
          loadingLabel="Saving…"
        />
      </DialogContent>
    </Dialog>
  );
}
