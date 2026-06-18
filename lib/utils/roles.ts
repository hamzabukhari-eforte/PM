import type { Role } from "@/lib/api/types";

/** Admin encompasses platform admin and Scrum Master responsibilities. */
export function isAdmin(role: Role | undefined): boolean {
  return role === "admin";
}

export function isScrumMaster(role: Role | undefined): boolean {
  return isAdmin(role);
}

export function canManageProjects(role: Role | undefined): boolean {
  return isAdmin(role);
}

export function canManageTeam(role: Role | undefined): boolean {
  return isAdmin(role);
}

export function canManageSprints(role: Role | undefined): boolean {
  return isAdmin(role);
}

export function canArchiveTasks(role: Role | undefined): boolean {
  return isAdmin(role);
}

export function canViewTeamStandups(role: Role | undefined): boolean {
  return isScrumMaster(role);
}

export function canManagePersonalTasks(role: Role | undefined): boolean {
  return isScrumMaster(role);
}

/** Developers submit daily standups; admin / Scrum Master reviews team responses only. */
export function requiresStandup(role: Role | undefined): boolean {
  return role === "developer";
}

export function canManageTasks(): boolean {
  return true;
}

export function roleLabel(role: Role): string {
  return role === "admin" ? "Admin / Scrum Master" : "Developer";
}

export const assignableRoles: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin / Scrum Master" },
  { value: "developer", label: "Developer" },
];
