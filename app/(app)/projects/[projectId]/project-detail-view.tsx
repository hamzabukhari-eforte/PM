"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project } from "@/lib/api/types";
import { useUiStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManageTeam } from "@/lib/utils/roles";

export function ProjectDetailView() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);
  const user = useAuthStore((s) => s.user);
  const canManage = canManageTeam(user?.role);

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient<Project>(endpoints.projects.detail(projectId)),
    enabled: !!projectId,
  });

  return (
    <>
      <AppHeader title={project?.name ?? "Project"} />
      <div className="space-y-6 p-6 lg:p-8">
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {project && (
          <>
            <p className="text-muted-foreground">{project.description}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Team</CardTitle></CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${projectId}/team/`}>
                      {canManage ? "Manage team" : "View team"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Sprints</CardTitle></CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${projectId}/sprints/`}>View sprints</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Reports</CardTitle></CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${projectId}/reports/`}>View reports</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Stats</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{project.memberCount} members</p>
                  <p>{project.activeSprintCount} active sprints</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
