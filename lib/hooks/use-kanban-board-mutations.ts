"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export function useKanbanBoardMutations(projectId: string, sprintId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["board", projectId, sprintId] });
    void queryClient.invalidateQueries({ queryKey: ["backlog", projectId, sprintId] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: { taskId: string; body: UpdateTaskInput }) =>
      apiClient(endpoints.tasks.update(payload.taskId), {
        method: "PATCH",
        body: JSON.stringify(payload.body),
      }),
    onSuccess: invalidate,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskInput) =>
      apiClient(endpoints.projects.tasks(projectId, sprintId), {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  return { updateMutation, createMutation };
}
