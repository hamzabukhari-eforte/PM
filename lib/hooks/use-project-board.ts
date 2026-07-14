"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Sprint } from "@/lib/api/types";
import { projectHref, sprintHref } from "@/lib/utils/static-routes";

export function pickPreferredSprint(sprints: Sprint[]): Sprint | null {
  if (sprints.length === 0) return null;
  return sprints.find((s) => s.status === "active") ?? sprints[0] ?? null;
}

export function boardPath(projectId: string, sprintId: string) {
  return sprintHref(projectId, sprintId, "board/");
}

export function useProjectBoard(projectId: string | null | undefined) {
  const query = useQuery({
    queryKey: ["sprints", projectId, "board-pick"],
    queryFn: () => apiClient<Sprint[]>(endpoints.projects.sprints(projectId!)),
    enabled: !!projectId,
    staleTime: 60_000,
  });

  const sprint = query.data ? pickPreferredSprint(query.data) : null;

  return {
    sprint,
    boardUrl: sprint && projectId ? boardPath(projectId, sprint.id) : null,
    sprintsUrl: projectId ? projectHref(projectId, "sprints/") : null,
    isLoading: query.isLoading,
  };
}
