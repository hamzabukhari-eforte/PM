"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronRight, Download, Flag, Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { PlanTaskDialog } from "@/components/plan/plan-task-dialog";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PlanTask, Project, ProjectMember, ProjectPlan } from "@/lib/api/types";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";
import { memberNamesFromIds } from "@/lib/utils/task-assignees";
import { downloadPlanCsv, flattenPlanForTable } from "@/lib/utils/plan-export";
import { useProjectMembers } from "@/lib/hooks/use-project-members";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return isoToTicketDateTimeLocal(iso);
}

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

  const taskTitlesByCode = useMemo(() => {
    return new Map(tableRows.map(({ node }) => [node.code, node.title] as const));
  }, [tableRows]);

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

            <div className="scrollbar-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 w-32">Code</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 w-44">Start</th>
                    <th className="px-4 py-3 w-44">End</th>
                    <th className="px-4 py-3 w-40">Assign to</th>
                    <th className="px-4 py-3 w-36">Milestone</th>
                    <th className="px-4 py-3 w-40">Depends on</th>
                    <th className="px-4 py-3 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[14px] text-slate-700">
                  {tableRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                        No plan tasks yet. Add tasks to build the WBS.
                      </td>
                    </tr>
                  )}
                  {tableRows.map(({ node, depth }) => (
                    <PlanTableRow
                      key={node.id}
                      node={node}
                      depth={depth}
                      members={members}
                      taskTitlesByCode={taskTitlesByCode}
                      onEdit={openEdit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
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

function PlanTableRow({
  node,
  depth,
  members,
  taskTitlesByCode,
  onEdit,
}: {
  node: PlanTask;
  depth: number;
  members: ProjectMember[];
  taskTitlesByCode: Map<string, string>;
  onEdit: (node: PlanTask) => void;
}) {
  const assigneeNames = memberNamesFromIds(node.memberIds, members);
  const dependencyTitle = node.dependentTaskCode
    ? taskTitlesByCode.get(node.dependentTaskCode)
    : null;

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-indigo-50/30">
      <td
        className="w-32 py-3 px-4 align-middle font-mono text-[14px] font-semibold tabular-nums text-indigo-600 whitespace-nowrap"
      >
        {node.code}
      </td>
      <td className="px-4 py-3 align-middle">
        <p className="font-medium text-slate-900">{node.title}</p>
        {node.description && (
          <p className="mt-0.5 leading-relaxed text-slate-500">{node.description}</p>
        )}
      </td>
      <td className="px-4 py-3 align-middle whitespace-nowrap text-slate-600">
        {formatDate(node.timelineStart)}
      </td>
      <td className="px-4 py-3 align-middle whitespace-nowrap text-slate-600">
        {formatDate(node.timelineEnd)}
      </td>
      <td className="px-4 py-3 align-middle text-slate-700">
        {assigneeNames.length > 0 ? assigneeNames.join(", ") : "—"}
      </td>
      <td className="px-4 py-3 align-middle">
        {node.isMilestone ? (
          <div className="space-y-0.5">
            <Badge variant="secondary" className="gap-1 text-[12px]">
              <Flag className="h-3 w-3" />
              {node.milestoneNo ?? "Milestone"}
            </Badge>
            {node.milestoneDescription && (
              <p className="text-slate-500">{node.milestoneDescription}</p>
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-middle">
        {node.isDependent && node.dependentTaskCode ? (
          <div className="space-y-0.5">
            <Badge variant="outline" className="font-mono text-[12px]">
              {node.dependentTaskCode}
            </Badge>
            {dependencyTitle && (
              <p className="text-slate-500">{dependencyTitle}</p>
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 cursor-pointer"
          onClick={() => onEdit(node)}
        >
          Edit
        </Button>
      </td>
    </tr>
  );
}
