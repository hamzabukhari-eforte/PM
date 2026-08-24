import type { MenuItem, MenuTreeNode } from "@/lib/api/types";
import { isValidMenuPath } from "@/lib/navigation/screen-paths";

export function buildMenuTree(items: MenuItem[]): MenuTreeNode[] {
  const valid = items
    .filter((item) => isValidMenuPath(item.path))
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const byId = new Map<string, MenuTreeNode>();
  for (const item of valid) {
    byId.set(item.id, { ...item, children: [] });
  }

  const roots: MenuTreeNode[] = [];
  for (const node of byId.values()) {
    const parentId = node.parentId ?? null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRecursive = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const n of nodes) sortRecursive(n.children);
  };
  sortRecursive(roots);
  return roots;
}

/** Hide project-scoped leaves when no project is selected; drop empty groups. */
export function filterMenuTree(
  nodes: MenuTreeNode[],
  hasProject: boolean,
): MenuTreeNode[] {
  return nodes
    .map((node) => {
      const children = filterMenuTree(node.children, hasProject);
      const selfVisible =
        !node.requiresProject || hasProject || children.length > 0;
      if (!selfVisible) return null;
      if (node.requiresProject && !hasProject && !node.path) {
        // group with only project children already filtered via children
      }
      if (node.requiresProject && !hasProject && node.path && children.length === 0) {
        return null;
      }
      return { ...node, children };
    })
    .filter((n): n is MenuTreeNode => n != null)
    .filter((n) => n.path != null || n.children.length > 0);
}
