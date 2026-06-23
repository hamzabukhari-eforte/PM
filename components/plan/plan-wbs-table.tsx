"use client";

import type { PlanTask, ProjectMember } from "@/lib/api/types";
import type { PlanTableRow as PlanTableRowData } from "@/lib/utils/plan-export";
import { PlanTableRow } from "@/components/plan/plan-table-row";

export function PlanWbsTable({
  rows,
  members,
  taskTitlesByCode,
  onEdit,
}: {
  rows: PlanTableRowData[];
  members: ProjectMember[];
  taskTitlesByCode: Map<string, string>;
  onEdit: (node: PlanTask) => void;
}) {
  return (
    <div className="scrollbar-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[960px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="w-32 px-4 py-3">Code</th>
            <th className="px-4 py-3">Description</th>
            <th className="w-44 px-4 py-3">Start</th>
            <th className="w-44 px-4 py-3">End</th>
            <th className="w-40 px-4 py-3">Assign to</th>
            <th className="w-36 px-4 py-3">Milestone</th>
            <th className="w-40 px-4 py-3">Depends on</th>
            <th className="w-20 px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-[14px] text-slate-700">
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                No plan tasks yet. Add tasks to build the WBS.
              </td>
            </tr>
          )}
          {rows.map(({ node }) => (
            <PlanTableRow
              key={node.id}
              node={node}
              members={members}
              taskTitlesByCode={taskTitlesByCode}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
