import type { PlanTask, ProjectPlan } from "@/lib/api/types";

export function nextPlanCode(nodes: PlanTask[], parentId: string | null): string {
  if (!parentId) return String(nodes.length + 1);

  function findParent(list: PlanTask[]): PlanTask | null {
    for (const n of list) {
      if (n.id === parentId) return n;
      const found = n.subtasks ? findParent(n.subtasks) : null;
      if (found) return found;
    }
    return null;
  }

  const parent = findParent(nodes);
  const count = parent?.subtasks?.length ?? 0;
  return parent ? `${parent.code}.${count + 1}` : String(count + 1);
}

export function findPlanParentId(
  nodes: PlanTask[],
  childId: string,
  parent: string | null = null,
): string | null {
  for (const n of nodes) {
    if (n.id === childId) return parent;
    if (n.subtasks?.length) {
      const found = findPlanParentId(n.subtasks, childId, n.id);
      if (found !== null) return found;
    }
  }
  return null;
}

export function flattenPlanTasks(nodes: PlanTask[]): PlanTask[] {
  const out: PlanTask[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.subtasks?.length) out.push(...flattenPlanTasks(n.subtasks));
  }
  return out;
}

function collectSubtreeIds(node: PlanTask): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.subtasks ?? []) {
    for (const id of collectSubtreeIds(child)) ids.add(id);
  }
  return ids;
}

export function planDependencyOptions(plan: ProjectPlan, editingNode: PlanTask | null): PlanTask[] {
  const all = flattenPlanTasks(plan.nodes);
  if (!editingNode) return all;
  const exclude = collectSubtreeIds(editingNode);
  return all.filter((t) => !exclude.has(t.id));
}

export function upsertPlanNode(
  nodes: PlanTask[],
  parentId: string | null,
  node: PlanTask,
  isEdit: boolean,
): PlanTask[] {
  if (!parentId) {
    if (isEdit) {
      return nodes.map((n) =>
        n.id === node.id
          ? node
          : {
              ...n,
              subtasks: n.subtasks ? upsertPlanNode(n.subtasks, parentId, node, true) : n.subtasks,
            },
      );
    }
    return [...nodes, node];
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      const subs = n.subtasks ?? [];
      if (isEdit) {
        return { ...n, subtasks: subs.map((s) => (s.id === node.id ? node : s)) };
      }
      return { ...n, subtasks: [...subs, node] };
    }
    if (n.subtasks?.length) {
      return { ...n, subtasks: upsertPlanNode(n.subtasks, parentId, node, isEdit) };
    }
    return n;
  });
}
