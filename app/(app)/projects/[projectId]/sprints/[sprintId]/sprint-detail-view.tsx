"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import type { CreateTaskFormData } from "@/components/tasks/create-task-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CreateTaskInput, Sprint, Task } from "@/lib/api/types";
import {
  defaultTodoColumnId,
  useProjectMembers,
} from "@/lib/hooks/use-project-members";

export function SprintDetailView() {
  const params = useParams<{ projectId: string; sprintId: string }>();
  const { projectId, sprintId } = params;
  const queryClient = useQueryClient();

  const sprintQuery = useQuery({
    queryKey: ["sprint", projectId, sprintId],
    queryFn: async () => {
      const all = await apiClient<Sprint[]>(endpoints.projects.sprints(projectId));
      return all.find((s) => s.id === sprintId) ?? null;
    },
    enabled: !!projectId && !!sprintId,
  });

  const backlogQuery = useQuery({
    queryKey: ["backlog", projectId, sprintId],
    queryFn: () => apiClient<Task[]>(endpoints.projects.backlog(projectId, sprintId)),
    enabled: !!projectId && !!sprintId,
  });

  const membersQuery = useProjectMembers(projectId);

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskInput) =>
      apiClient(endpoints.projects.tasks(projectId, sprintId), {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["backlog", projectId, sprintId] });
      void queryClient.invalidateQueries({ queryKey: ["board", projectId, sprintId] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function handleCreateTask(data: CreateTaskFormData) {
    createMutation.mutate({
      title: data.title,
      description: data.description,
      columnId: defaultTodoColumnId(sprintId),
      assigneeId: data.assigneeId ?? null,
      storyPoints: data.storyPoints ? Number(data.storyPoints) : null,
    });
  }

  const sprint = sprintQuery.data;

  return (
    <>
      <AppHeader title={sprint?.name ?? "Sprint"} />
      <div className="space-y-6 p-6 lg:p-8">
        {sprintQuery.isLoading && <LoadingState />}
        {sprintQuery.isError && <ErrorState onRetry={() => void sprintQuery.refetch()} />}
        {sprint && (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <Badge>{sprint.status}</Badge>
              <p className="text-sm text-muted-foreground">
                {sprint.startDate} → {sprint.endDate}
              </p>
              <Button asChild>
                <Link href={`/projects/${projectId}/sprints/${sprintId}/board/`}>
                  Open board
                </Link>
              </Button>
            </div>
            <p className="text-muted-foreground">{sprint.goal}</p>
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Backlog</h2>
                <AddTaskDialog
                  members={membersQuery.data ?? []}
                  columnLabel="To Do"
                  onSubmit={handleCreateTask}
                  loading={createMutation.isPending}
                />
              </div>
              {backlogQuery.isLoading && <LoadingState />}
              {backlogQuery.data?.length === 0 && (
                <EmptyState
                  title="Backlog is empty"
                  description="Create a task to get started on this sprint."
                />
              )}
              <div className="space-y-2">
                {backlogQuery.data?.map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    {task.description && (
                      <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      {task.assigneeName && <span>{task.assigneeName}</span>}
                      {task.storyPoints != null && <span>{task.storyPoints} pts</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
