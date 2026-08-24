"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { PageContent } from "@/components/layout/page-content";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectTable } from "@/components/projects/project-table";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project } from "@/lib/api/types";
import { useViewMode } from "@/lib/hooks/use-view-mode";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManageProjects } from "@/lib/utils/roles";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";

export function ProjectsListView() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useViewMode("projects-view-mode");

  const { data: projects = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient<Project[]>(endpoints.projects.list),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(endpoints.projects.detail(id), {
        method: "PATCH",
        body: JSON.stringify({ archived: true }),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const canArchive = canManageProjects(user?.role);

  return (
    <>
      <AppHeader
        title="Projects"
        showProjectSwitcher={false}
        actions={
          <>
            <RoleGuard roles={["admin"]}>
              <Button size="sm" asChild>
                <Link href={SCREEN_PATHS.projectsNew}>New project</Link>
              </Button>
            </RoleGuard>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </>
        }
      />
      <PageContent className="space-y-4">
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}

        {!isLoading && !isError && projects.length === 0 && (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started."
            action={
              canArchive ? (
                <Button asChild>
                  <Link href={SCREEN_PATHS.projectsNew}>Create project</Link>
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading && !isError && projects.length > 0 && (
          viewMode === "cards" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onArchive={canArchive ? () => archiveMutation.mutate(project.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <ProjectTable
              projects={projects}
              onArchive={canArchive ? (id) => archiveMutation.mutate(id) : undefined}
            />
          )
        )}
      </PageContent>
    </>
  );
}
