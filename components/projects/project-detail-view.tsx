"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ClipboardList, Settings, Users } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { BoardQuickLink } from "@/components/layout/board-quick-link";
import { PageContent } from "@/components/layout/page-content";
import { ProjectGettingStarted } from "@/components/projects/project-getting-started";
import {
  ProjectDetailHero,
  ProjectDetailMetaSection,
  ProjectQuickLinkCard,
} from "@/components/projects/project-detail-sections";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project, ProjectLookups, ProjectPlan, Sprint } from "@/lib/api/types";
import { useUiStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManageProjects, canManageTeam } from "@/lib/utils/roles";
import { countPlanTasks } from "@/lib/utils/project-lookups";
import { cn } from "@/lib/utils";

export function ProjectDetailView() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);
  const user = useAuthStore((s) => s.user);
  const canManage = canManageTeam(user?.role);
  const canSettings = canManageProjects(user?.role);

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient<Project>(endpoints.projects.detail(projectId)),
    enabled: !!projectId,
  });

  const lookupsQuery = useQuery({
    queryKey: ["lookups", "project"],
    queryFn: () => apiClient<ProjectLookups>(endpoints.lookups.project),
  });

  const planQuery = useQuery({
    queryKey: ["plan", projectId],
    queryFn: () => apiClient<ProjectPlan>(endpoints.projects.plan(projectId)),
    enabled: !!projectId,
  });

  const sprintsQuery = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => apiClient<Sprint[]>(endpoints.projects.sprints(projectId)),
    enabled: !!projectId,
  });

  const planTaskCount = useMemo(
    () => (planQuery.data ? countPlanTasks(planQuery.data.nodes) : 0),
    [planQuery.data],
  );
  const sprintCount = sprintsQuery.data?.length ?? 0;
  const hasActiveSprint = sprintsQuery.data?.some((s) => s.status === "active") ?? false;

  return (
    <>
      <AppHeader
        title={project?.name ?? "Project"}
        description={project?.description}
        actions={project ? <BoardQuickLink projectId={projectId} tone="primary" size="sm" /> : undefined}
      />
      <PageContent>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {project && (
          <>
            <ProjectDetailHero project={project} projectId={projectId} lookups={lookupsQuery.data} />
            <ProjectGettingStarted
              projectId={projectId}
              planTaskCount={planTaskCount}
              sprintCount={sprintCount}
              hasActiveSprint={hasActiveSprint}
            />
            <div className={cn("grid gap-4", canSettings ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3")}>
              <ProjectQuickLinkCard
                href={`/projects/${projectId}/plan/`}
                icon={ClipboardList}
                title="Project plan"
                description="Work breakdown & milestones"
              />
              <ProjectQuickLinkCard
                href={`/projects/${projectId}/team/`}
                icon={Users}
                title="Team"
                description={canManage ? "Manage members" : "View members"}
              />
              <ProjectQuickLinkCard
                href={`/projects/${projectId}/reports/`}
                icon={BarChart3}
                title="Reports"
                description="Burndown, velocity & metrics"
              />
              {canSettings && (
                <ProjectQuickLinkCard
                  href={`/projects/${projectId}/settings/`}
                  icon={Settings}
                  title="Settings"
                  description="Permissions & plan options"
                />
              )}
            </div>
            <ProjectDetailMetaSection project={project} lookups={lookupsQuery.data} />
          </>
        )}
      </PageContent>
    </>
  );
}
