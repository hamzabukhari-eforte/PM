"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Sprint } from "@/lib/api/types";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";

export function pickPreferredSprint(sprints: Sprint[]): Sprint | null {
  if (sprints.length === 0) return null;
  return sprints.find((s) => s.status === "active") ?? sprints[0] ?? null;
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
    boardUrl: sprint && projectId ? SCREEN_PATHS.board : null,
    preferredSprintId: sprint?.id ?? null,
    sprintsUrl: projectId ? SCREEN_PATHS.sprints : null,
    isLoading: query.isLoading,
  };
}
