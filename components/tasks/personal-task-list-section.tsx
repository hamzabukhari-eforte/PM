"use client";

import { AddPersonalTaskDialog } from "@/components/tasks/add-personal-task-dialog";
import { PersonalTaskCard } from "@/components/tasks/personal-task-card";
import { PersonalTaskTable } from "@/components/tasks/personal-task-table";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { LoadingState } from "@/components/ui/loading-state";
import type { CreatePersonalTaskInput, Task, TaskStatus, User } from "@/lib/api/types";
import { taskIsAssignedTo } from "@/lib/utils/task-assignees";
import { cn } from "@/lib/utils";

export function PersonalTaskListSection({
  kind,
  tasks,
  loading,
  isAdmin,
  assignees,
  onCreate,
  creating,
  onStatusChange,
  currentUserId,
  viewMode,
  onViewModeChange,
}: {
  kind: "miscellaneous" | "routine";
  tasks: Task[] | undefined;
  loading: boolean;
  isAdmin: boolean;
  assignees: User[];
  onCreate: (data: CreatePersonalTaskInput) => void;
  creating: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  currentUserId?: string;
  viewMode: "cards" | "table";
  onViewModeChange: (mode: "cards" | "table") => void;
}) {
  const description =
    kind === "routine"
      ? "Recurring tasks assigned by your Scrum Master — reminders on an hourly, daily, weekly, or longer cadence."
      : "One-off tasks assigned by your Scrum Master — no project required.";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-slate-500">{description}</p>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
          {isAdmin && (
            <AddPersonalTaskDialog
              kind={kind}
              assignees={assignees}
              onSubmit={onCreate}
              loading={creating}
            />
          )}
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>
      {loading && <LoadingState />}
      {viewMode === "cards" ? (
        <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", tasks?.length ? "" : "hidden")}>
          {tasks?.map((task) => (
            <PersonalTaskCard
              key={task.id}
              task={task}
              canUpdate={isAdmin || taskIsAssignedTo(task, currentUserId)}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        tasks &&
        tasks.length > 0 && (
          <PersonalTaskTable
            tasks={tasks}
            canUpdate={isAdmin}
            onStatusChange={onStatusChange}
            currentUserId={currentUserId}
          />
        )
      )}
      {!loading && tasks?.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
          {isAdmin
            ? `No ${kind} tasks yet. Create one and assign it to a team member.`
            : `No ${kind} tasks assigned to you yet.`}
        </p>
      )}
    </div>
  );
}
