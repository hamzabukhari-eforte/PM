"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { ProjectCard } from "@/components/projects/project-card";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManageProjects } from "@/lib/utils/roles";

export default function ProjectsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

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

  return (
    <>
      <AppHeader title="Projects" />
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex justify-end">
          <RoleGuard roles={["admin"]}>
            <Button asChild>
              <Link href="/projects/new/">New project</Link>
            </Button>
          </RoleGuard>
        </div>

        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}

        {!isLoading && !isError && projects.length === 0 && (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started."
            action={
              canManageProjects(user?.role) ? (
                <Button asChild>
                  <Link href="/projects/new/">Create project</Link>
                </Button>
              ) : undefined
            }
          />
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onArchive={
                canManageProjects(user?.role)
                  ? () => archiveMutation.mutate(project.id)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}
