"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { AppHeader } from "@/components/layout/app-header";
import { PageContent } from "@/components/layout/page-content";
import { AddPersonalTaskDialog } from "@/components/tasks/add-personal-task-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CreatePersonalTaskInput,
  Task,
  TaskStatus,
  User,
} from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManagePersonalTasks } from "@/lib/utils/roles";
import { recurrenceLabels } from "@/lib/utils/routine";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";
import { cn } from "@/lib/utils";

const statusFlow: TaskStatus[] = ["todo", "in_progress", "review", "done"];
const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  done: "Done",
};

function PersonalTaskCard({
  task,
  canUpdate,
  onStatusChange,
}: {
  task: Task;
  canUpdate: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const nextIdx = statusFlow.indexOf(task.status) + 1;
  const nextStatus = nextIdx < statusFlow.length ? statusFlow[nextIdx] : null;

  return (
    <Card className="card-interactive h-full border-slate-200/80">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-medium leading-snug">{task.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {statusLabels[task.status]}
          </Badge>
        </div>
        {task.description && (
          <p className="text-sm text-slate-500">{task.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {task.assigneeName && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {task.assigneeName}
            </span>
          )}
          {task.storyPoints != null && (
            <span>{task.storyPoints} pts</span>
          )}
          {task.kind === "routine" && task.recurrenceInterval && (
            <span className="flex items-center gap-1 text-indigo-600">
              <RefreshCw className="h-3 w-3" />
              {recurrenceLabels[task.recurrenceInterval]}
            </span>
          )}
          {task.nextReminderAt && (
            <span>Next: {format(new Date(task.nextReminderAt), "MMM d, h:mm a")}</span>
          )}
          {task.timelineStart && task.timelineEnd && (
            <span className="flex items-center gap-1">
              <CalendarRange className="h-3 w-3" />
              {isoToTicketDateTimeLocal(task.timelineStart)} →{" "}
              {isoToTicketDateTimeLocal(task.timelineEnd)}
            </span>
          )}
        </div>
        {canUpdate && nextStatus && (
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => onStatusChange(task.id, nextStatus)}
          >
            Move to {statusLabels[nextStatus]}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function TaskListSection({
  kind,
  tasks,
  loading,
  isAdmin,
  assignees,
  onCreate,
  creating,
  onStatusChange,
  currentUserId,
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
}) {
  const description =
    kind === "routine"
      ? "Recurring tasks assigned by your Scrum Master — reminders on an hourly, daily, weekly, or longer cadence."
      : "One-off tasks assigned by your Scrum Master — no project required.";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-slate-500">{description}</p>
        {isAdmin && (
          <AddPersonalTaskDialog
            kind={kind}
            assignees={assignees}
            onSubmit={onCreate}
            loading={creating}
          />
        )}
      </div>
      {loading && <LoadingState />}
      <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", tasks?.length ? "" : "hidden")}>
        {tasks?.map((task) => (
          <PersonalTaskCard
            key={task.id}
            task={task}
            canUpdate={isAdmin || task.assigneeId === currentUserId}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
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

export function TasksView() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = canManagePersonalTasks(user?.role);

  const assigneesQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient<User[]>(endpoints.users.list),
    enabled: isAdmin,
  });

  const assignees =
    assigneesQuery.data?.filter((u) => u.role === "developer") ?? [];

  const miscQuery = useQuery({
    queryKey: ["personal-tasks", "miscellaneous", user?.id],
    queryFn: () => apiClient<Task[]>(endpoints.tasks.personal("miscellaneous")),
    enabled: !!user?.id,
  });

  const routineQuery = useQuery({
    queryKey: ["personal-tasks", "routine", user?.id],
    queryFn: () => apiClient<Task[]>(endpoints.tasks.personal("routine")),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePersonalTaskInput) =>
      apiClient(endpoints.tasks.personal(), {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["personal-tasks", vars.kind] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      apiClient(endpoints.tasks.update(taskId), {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["personal-tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <>
      <AppHeader
        title="Tasks"
        description={
          isAdmin
            ? "Create and assign miscellaneous and routine work outside project boards."
            : "Tasks assigned to you by your Scrum Master."
        }
      />
      <PageContent>
        <Tabs defaultValue="miscellaneous">
          <TabsList>
            <TabsTrigger value="miscellaneous">Miscellaneous</TabsTrigger>
            <TabsTrigger value="routine">Routine</TabsTrigger>
          </TabsList>

          <TabsContent value="miscellaneous">
            <TaskListSection
              kind="miscellaneous"
              tasks={miscQuery.data}
              loading={miscQuery.isLoading}
              isAdmin={isAdmin}
              assignees={assignees}
              onCreate={(data) => createMutation.mutate(data)}
              creating={createMutation.isPending}
              onStatusChange={(id, status) => statusMutation.mutate({ taskId: id, status })}
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="routine">
            <TaskListSection
              kind="routine"
              tasks={routineQuery.data}
              loading={routineQuery.isLoading}
              isAdmin={isAdmin}
              assignees={assignees}
              onCreate={(data) => createMutation.mutate(data)}
              creating={createMutation.isPending}
              onStatusChange={(id, status) => statusMutation.mutate({ taskId: id, status })}
              currentUserId={user?.id}
            />
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}
