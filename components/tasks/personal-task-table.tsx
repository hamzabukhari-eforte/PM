"use client";

import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recurrenceLabels } from "@/lib/utils/routine";
import { formatAssigneeNames, taskIsAssignedTo } from "@/lib/utils/task-assignees";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";

import { personalTaskStatusFlow, personalTaskStatusLabels } from "@/lib/utils/personal-task-status";

export function PersonalTaskTable({
  tasks,
  canUpdate,
  onStatusChange,
  currentUserId,
}: {
  tasks: Task[];
  canUpdate: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  currentUserId?: string;
}) {
  return (
    <div className="scrollbar-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[800px] border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3 w-36">Assignee</th>
            <th className="px-4 py-3 w-28">Status</th>
            <th className="px-4 py-3 w-20">Points</th>
            <th className="px-4 py-3 w-36">Schedule</th>
            <th className="px-4 py-3 w-40 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {tasks.map((task) => {
            const nextIdx = personalTaskStatusFlow.indexOf(task.status) + 1;
            const nextStatus = nextIdx < personalTaskStatusFlow.length ? personalTaskStatusFlow[nextIdx] : null;
            const userCanUpdate = canUpdate || taskIsAssignedTo(task, currentUserId);

            return (
              <tr key={task.id} className="border-b border-slate-100 hover:bg-indigo-50/30">
                <td className="px-4 py-3 align-middle">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  {task.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{task.description}</p>
                  )}
                  {task.kind === "routine" && task.recurrenceInterval && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600">
                      <RefreshCw className="h-3 w-3" />
                      {recurrenceLabels[task.recurrenceInterval]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-middle whitespace-nowrap">
                  {task.assigneeNames.length > 0 ? formatAssigneeNames(task.assigneeNames) : "—"}
                </td>
                <td className="px-4 py-3 align-middle">
                  <Badge variant="secondary" className="capitalize">
                    {personalTaskStatusLabels[task.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 align-middle whitespace-nowrap">
                  {task.storyPoints ?? "—"}
                </td>
                <td className="px-4 py-3 align-middle text-sm text-slate-600">
                  {task.timelineStart && task.timelineEnd ? (
                    <span className="whitespace-nowrap">
                      {isoToTicketDateTimeLocal(task.timelineStart)} →{" "}
                      {isoToTicketDateTimeLocal(task.timelineEnd)}
                    </span>
                  ) : task.nextReminderAt ? (
                    <span className="whitespace-nowrap">
                      Next: {format(new Date(task.nextReminderAt), "MMM d, h:mm a")}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 align-middle text-right">
                  {userCanUpdate && nextStatus ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => onStatusChange(task.id, nextStatus)}
                    >
                      → {personalTaskStatusLabels[nextStatus]}
                    </Button>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
