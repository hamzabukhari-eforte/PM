"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
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
import { useRequireProjectId } from "@/lib/hooks/use-project-context";
import { useAuthStore } from "@/lib/stores/auth-store";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";
import { canManageProjects, canManageTeam } from "@/lib/utils/roles";
import { countPlanTasks } from "@/lib/utils/project-lookups";
import { cn } from "@/lib/utils";

export function ProjectDetailView() {
  const projectId = useRequireProjectId();
  const user = useAuthStore((s) => s.user);
  const canManage = canManageTeam(user?.role);
  const canSettings = canManageProjects(user?.role);

  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient<Project>(endpoints.projects.detail(projectId!)),
    enabled: !!projectId,
  });

  const lookupsQuery = useQuery({
    queryKey: ["lookups", "project"],
    queryFn: () => apiClient<ProjectLookups>(endpoints.lookups.project),
  });

  const planQuery = useQuery({
    queryKey: ["plan", projectId],
    queryFn: () => apiClient<ProjectPlan>(endpoints.projects.plan(projectId!)),
    enabled: !!projectId,
  });

  const sprintsQuery = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => apiClient<Sprint[]>(endpoints.projects.sprints(projectId!)),
    enabled: !!projectId,
  });

  const planTaskCount = useMemo(
    () => (planQuery.data ? countPlanTasks(planQuery.data.nodes) : 0),
    [planQuery.data],
  );
  const sprintCount = sprintsQuery.data?.length ?? 0;
  const hasActiveSprint = sprintsQuery.data?.some((s) => s.status === "active") ?? false;

  if (!projectId) {
    return (
      <PageContent>
        <LoadingState label="Select a project…" />
      </PageContent>
    );
  }

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
              planTaskCount={planTaskCount}
              sprintCount={sprintCount}
              hasActiveSprint={hasActiveSprint}
            />
            <div className={cn("grid gap-4", canSettings ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3")}>
              <ProjectQuickLinkCard
                href={SCREEN_PATHS.plan}
                icon={ClipboardList}
                title="Project plan"
                description="Work breakdown & milestones"
              />
              <ProjectQuickLinkCard
                href={SCREEN_PATHS.team}
                icon={Users}
                title="Team"
                description={canManage ? "Manage members" : "View members"}
              />
              <ProjectQuickLinkCard
                href={SCREEN_PATHS.reports}
                icon={BarChart3}
                title="Reports"
                description="Burndown, velocity & metrics"
              />
              {canSettings && (
                <ProjectQuickLinkCard
                  href={SCREEN_PATHS.settings}
                  icon={Settings}
                  title="Settings"
                  description="Permissions & plan options"
                />
              )}
            </div>
            <ProjectDetailMetaSection project={project} lookups={lookupsQuery.data} />
            <p className="mt-4 text-sm text-slate-500">
              <Link href={SCREEN_PATHS.projects} className="text-indigo-600 hover:underline">
                Back to projects
              </Link>
            </p>
          </>
        )}
      </PageContent>
    </>
  );
}
