"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContent } from "@/components/layout/page-content";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { RoleGuard } from "@/components/auth/role-guard";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project, ProjectPlan } from "@/lib/api/types";
import { useResolvedProjectId } from "@/lib/hooks/use-route-ids";
import { useUiStore } from "@/lib/stores/ui-store";
import { projectHref } from "@/lib/utils/static-routes";

export function ProjectSettingsView() {
  const projectId = useResolvedProjectId();
  const queryClient = useQueryClient();
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);

  useEffect(() => {
    if (projectId) setActiveProjectId(projectId);
  }, [projectId, setActiveProjectId]);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient<Project>(endpoints.projects.detail(projectId)),
    enabled: !!projectId,
  });

  const planQuery = useQuery({
    queryKey: ["plan", projectId],
    queryFn: () => apiClient<ProjectPlan>(endpoints.projects.plan(projectId)),
    enabled: !!projectId,
  });

  const savePlanMutation = useMutation({
    mutationFn: (plan: ProjectPlan) =>
      apiClient<ProjectPlan>(endpoints.projects.plan(projectId), {
        method: "PUT",
        body: JSON.stringify(plan),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plan", projectId] });
    },
  });

  const plan = planQuery.data;
  const project = projectQuery.data;

  return (
    <RoleGuard roles={["admin"]} fallback={<p className="p-8 text-destructive">Access denied.</p>}>
      <AppHeader
        title={project ? `${project.name} — Settings` : "Project settings"}
        description="Manage permissions and plan behaviour for this project."
      />
      <PageContent width="form">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href={projectHref(projectId)} className="hover:text-primary">
            Project
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-800">Settings</span>
        </div>

        {(projectQuery.isLoading || planQuery.isLoading) && <LoadingState />}
        {planQuery.isError && <ErrorState onRetry={() => void planQuery.refetch()} />}

        {plan && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Task permissions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Control what team members can do on the Kanban board.
            </p>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <input
                type="checkbox"
                checked={plan.allowSubtaskCreation}
                disabled={savePlanMutation.isPending}
                onChange={(e) =>
                  savePlanMutation.mutate({ ...plan, allowSubtaskCreation: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-slate-900">
                  Let team members add subtasks on the board
                </span>
                <span className="block text-sm text-slate-500">
                  When enabled, assignees can break their tasks into smaller pieces without asking
                  an admin to update the plan.
                </span>
              </span>
            </label>

            {savePlanMutation.isPending && (
              <p className="mt-2 text-xs text-slate-400">Saving…</p>
            )}
          </section>
        )}

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href={projectHref(projectId)}>Back to project</Link>
          </Button>
        </div>
      </PageContent>
    </RoleGuard>
  );
}
