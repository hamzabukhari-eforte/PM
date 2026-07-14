"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProjectReportsSummary, Sprint, StandupEntry } from "@/lib/api/types";
import { useResolvedProjectId } from "@/lib/hooks/use-route-ids";
import { useUiStore } from "@/lib/stores/ui-store";

export function useProjectReports() {
  const projectId = useResolvedProjectId();
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);
  const [sprintId, setSprintId] = useState("");

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  const sprintsQuery = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => apiClient<Sprint[]>(endpoints.projects.sprints(projectId)),
    enabled: !!projectId,
  });

  const activeSprintId =
    sprintId || sprintsQuery.data?.find((s) => s.status === "active")?.id || "";

  const summaryQuery = useQuery({
    queryKey: ["report-summary", projectId, activeSprintId],
    queryFn: () =>
      apiClient<ProjectReportsSummary>(
        endpoints.projects.reports.summary(projectId, activeSprintId || undefined),
      ),
    enabled: !!projectId,
  });

  const standupsQuery = useQuery({
    queryKey: ["report-standups", projectId],
    queryFn: () => apiClient<StandupEntry[]>(endpoints.projects.reports.standups(projectId)),
    enabled: !!projectId,
  });

  return {
    projectId,
    report: summaryQuery.data,
    loading: summaryQuery.isLoading || sprintsQuery.isLoading,
    error: summaryQuery.isError,
    sprints: sprintsQuery.data,
    activeSprintId,
    setSprintId,
    standupsQuery,
    refetch: () => {
      void summaryQuery.refetch();
      void sprintsQuery.refetch();
    },
  };
}
