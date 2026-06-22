import type { PlanTask, ProjectMember, ProjectPlan } from "@/lib/api/types";
import { isoToTicketDateTimeLocal } from "@/lib/utils/ticket-datetime";

export interface PlanTableRow {
  node: PlanTask;
  depth: number;
}

export function flattenPlanForTable(nodes: PlanTask[], depth = 0): PlanTableRow[] {
  const rows: PlanTableRow[] = [];
  for (const node of nodes) {
    rows.push({ node, depth });
    if (node.subtasks?.length) {
      rows.push(...flattenPlanForTable(node.subtasks, depth + 1));
    }
  }
  return rows;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return isoToTicketDateTimeLocal(iso);
}

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function memberName(members: ProjectMember[], userId: string | null): string {
  if (!userId) return "";
  return members.find((m) => m.userId === userId)?.name ?? "";
}

function memberNames(members: ProjectMember[], memberIds: string[]): string {
  return memberIds
    .map((id) => members.find((m) => m.userId === id)?.name ?? id)
    .filter(Boolean)
    .join("; ");
}

export function buildPlanCsv(plan: ProjectPlan, members: ProjectMember[]): string {
  const headers = [
    "Code",
    "Level",
    "Title",
    "Description",
    "Start",
    "End",
    "Assignee",
    "Team Members",
    "Milestone",
    "Milestone No",
    "Milestone Description",
    "Dependent",
    "Depends On Code",
    "Kind",
  ];

  const rows = flattenPlanForTable(plan.nodes).map(({ node, depth }) => [
    node.code,
    depth + 1,
    node.title,
    node.description,
    formatDate(node.timelineStart),
    formatDate(node.timelineEnd),
    memberName(members, node.assigneeId),
    memberNames(members, node.memberIds),
    node.isMilestone ? "Yes" : "No",
    node.milestoneNo ?? "",
    node.milestoneDescription ?? "",
    node.isDependent ? "Yes" : "No",
    node.dependentTaskCode ?? "",
    node.kind,
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function downloadPlanCsv(plan: ProjectPlan, members: ProjectMember[], projectName?: string) {
  const csv = buildPlanCsv(plan, members);
  const safeName = (projectName ?? plan.projectId).replace(/[^\w.-]+/g, "_");
  const filename = `${safeName}_plan.csv`;
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
