"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProjectMember } from "@/lib/api/types";

export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: ["members", projectId],
    queryFn: () => apiClient<ProjectMember[]>(endpoints.projects.members(projectId!)),
    enabled: !!projectId,
  });
}

export function defaultTodoColumnId(sprintId: string) {
  return `${sprintId}-col-todo`;
}
