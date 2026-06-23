"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronRight, Download, Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { PlanTaskDialog } from "@/components/plan/plan-task-dialog";
import { PlanWbsTable } from "@/components/plan/plan-wbs-table";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PlanTask, Project, ProjectPlan } from "@/lib/api/types";
import { downloadPlanCsv, flattenPlanForTable } from "@/lib/utils/plan-export";
import { useProjectMembers } from "@/lib/hooks/use-project-members";

export function ProjectPlanView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<PlanTask | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => apiClient<Project>(endpoints.projects.detail(projectId)),
  });

  const planQuery = useQuery({
    queryKey: ["plan", projectId],
    queryFn: () => apiClient<ProjectPlan>(endpoints.projects.plan(projectId)),
  });

  const membersQuery = useProjectMembers(projectId);

  const saveMutation = useMutation({
    mutationFn: (plan: ProjectPlan) =>
      apiClient<ProjectPlan>(endpoints.projects.plan(projectId), {
        method: "PUT",
        body: JSON.stringify(plan),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plan", projectId] });
      setDialogOpen(false);
      setEditingNode(null);
    },
  });

  const plan = planQuery.data;
  const members = membersQuery.data ?? [];

  const tableRows = useMemo(
    () => (plan ? flattenPlanForTable(plan.nodes) : []),
    [plan],
  );

  const taskTitlesByCode = useMemo(
    () => new Map(tableRows.map(({ node }) => [node.code, node.title] as const)),
    [tableRows],
  );

  function openAdd(parent: string | null) {
    setEditingNode(null);
    setParentId(parent);
    setDialogOpen(true);
  }

  function openEdit(node: PlanTask) {
    setEditingNode(node);
    setParentId(null);
    setDialogOpen(true);
  }

  function handleExportCsv() {
    if (!plan) return;
    downloadPlanCsv(plan, members, projectQuery.data?.name);
  }

  return (
    <>
      <AppHeader title={projectQuery.data ? `${projectQuery.data.name} — Plan` : "Project plan"} />
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href={`/projects/${projectId}/`} className="hover:text-primary">
            Project
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-800">Project plan</span>
        </div>

        {planQuery.isLoading && <LoadingState />}
        {planQuery.isError && <ErrorState onRetry={() => void planQuery.refetch()} />}

        {plan && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Work breakdown schedule</h2>
                <p className="text-sm text-slate-500">
                  Full project WBS — sprints and Kanban boards execute against this plan.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-1.5" onClick={handleExportCsv}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/projects/${projectId}/sprints/`}>View sprints</Link>
                </Button>
                <Button className="gap-1.5" onClick={() => openAdd(null)}>
                  <Plus className="h-4 w-4" />
                  Add task
                </Button>
              </div>
            </div>

            <PlanWbsTable
              rows={tableRows}
              members={members}
              taskTitlesByCode={taskTitlesByCode}
              onEdit={openEdit}
            />
          </>
        )}
      </div>

      {plan && (
        <PlanTaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          plan={plan}
          editingNode={editingNode}
          parentId={parentId}
          members={members}
          loading={saveMutation.isPending}
          onSave={(updatedPlan) => saveMutation.mutate(updatedPlan)}
        />
      )}
    </>
  );
}
