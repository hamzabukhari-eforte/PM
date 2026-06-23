"use client";

import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PlanTask, ProjectMember } from "@/lib/api/types";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";
import { memberNamesFromIds } from "@/lib/utils/task-assignees";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return isoToTicketDateTimeLocal(iso);
}

export function PlanTableRow({
  node,
  members,
  taskTitlesByCode,
  onEdit,
}: {
  node: PlanTask;
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
      <td className="w-32 whitespace-nowrap px-4 py-3 align-middle font-mono text-[14px] font-semibold tabular-nums text-indigo-600">
        {node.code}
      </td>
      <td className="px-4 py-3 align-middle">
        <p className="font-medium text-slate-900">{node.title}</p>
        {node.description && (
          <p className="mt-0.5 leading-relaxed text-slate-500">{node.description}</p>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-middle text-slate-600">
        {formatDate(node.timelineStart)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-middle text-slate-600">
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
            {dependencyTitle && <p className="text-slate-500">{dependencyTitle}</p>}
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
