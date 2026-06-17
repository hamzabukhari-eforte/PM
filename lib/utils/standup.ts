import type { StandupEntry } from "@/lib/api/types";

/** Supports entries persisted before multi-project standups. */
type StandupEntryLike = Partial<StandupEntry> & {
  projectId?: string;
  projectName?: string;
};

export function normalizeStandupEntry(entry: StandupEntryLike): StandupEntry {
  const projectIds =
    entry.projectIds?.length
      ? entry.projectIds
      : entry.projectId
        ? [entry.projectId]
        : [];
  const projectNames =
    entry.projectNames?.length
      ? entry.projectNames
      : entry.projectName
        ? [entry.projectName]
        : [];

  return {
    id: entry.id ?? "",
    userId: entry.userId ?? "",
    userName: entry.userName ?? "",
    projectIds,
    projectNames,
    yesterday: entry.yesterday ?? "",
    today: entry.today ?? "",
    blockers: entry.blockers ?? "",
    submittedAt: entry.submittedAt ?? new Date().toISOString(),
  };
}

export function formatStandupProjectNames(entry: StandupEntryLike): string {
  const names = normalizeStandupEntry(entry).projectNames;
  return names.length > 0 ? names.join(", ") : "—";
}

export function standupIncludesProject(
  entry: StandupEntryLike,
  projectId: string,
): boolean {
  return normalizeStandupEntry(entry).projectIds.includes(projectId);
}
