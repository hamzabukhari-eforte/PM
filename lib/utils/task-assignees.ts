type NamedMember = { userId: string; name: string };

export function resolveAssignees(
  assigneeIds: string[],
  members: NamedMember[],
): { assigneeIds: string[]; assigneeNames: string[] } {
  const ids = [...new Set(assigneeIds.filter(Boolean))];
  const assigneeNames = ids
    .map((id) => members.find((m) => m.userId === id)?.name)
    .filter((name): name is string => !!name);
  return { assigneeIds: ids, assigneeNames };
}

export function taskIsAssignedTo(
  task: { assigneeIds?: string[] },
  userId: string | undefined,
): boolean {
  if (!userId) return false;
  return (task.assigneeIds ?? []).includes(userId);
}

export function matchesAssigneeFilter(
  assigneeIds: string[] | undefined,
  filter: "all" | "me" | string,
  currentUserId?: string,
): boolean {
  const ids = assigneeIds ?? [];
  if (filter === "all") return true;
  if (filter === "me") return currentUserId ? ids.includes(currentUserId) : false;
  return ids.includes(filter);
}

export function formatAssigneeNames(names: string[]): string {
  if (names.length === 0) return "Unassigned";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

export function memberNamesFromIds(memberIds: string[], members: NamedMember[]): string[] {
  return memberIds
    .map((id) => members.find((m) => m.userId === id)?.name)
    .filter((name): name is string => !!name);
}
