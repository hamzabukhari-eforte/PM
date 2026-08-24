/** Fixed screen paths for Option A (DB menus may only use these). */
export const SCREEN_PATHS = {
  dashboard: "/dashboard/",
  projects: "/projects/",
  projectsNew: "/projects/new/",
  project: "/project/",
  plan: "/plan/",
  team: "/team/",
  reports: "/reports/",
  settings: "/settings/",
  sprints: "/sprints/",
  sprint: "/sprint/",
  board: "/board/",
  tasks: "/tasks/",
  standup: "/standup/",
  login: "/login/",
} as const;

export type ScreenPath = (typeof SCREEN_PATHS)[keyof typeof SCREEN_PATHS];

const ALLOWED = new Set<string>(Object.values(SCREEN_PATHS));

export function isAllowedScreenPath(path: string): path is ScreenPath {
  return ALLOWED.has(path);
}

/** Leaf items need an allowlisted path; group rows may have null path. */
export function isValidMenuPath(path: string | null | undefined): boolean {
  if (path == null || path === "") return true;
  return isAllowedScreenPath(path);
}

/** Paths that require an active project in the UI store. */
export const PROJECT_SCOPED_PATHS = new Set<string>([
  SCREEN_PATHS.project,
  SCREEN_PATHS.plan,
  SCREEN_PATHS.team,
  SCREEN_PATHS.reports,
  SCREEN_PATHS.settings,
  SCREEN_PATHS.sprints,
  SCREEN_PATHS.sprint,
  SCREEN_PATHS.board,
]);

/** Paths that require an active sprint as well. */
export const SPRINT_SCOPED_PATHS = new Set<string>([
  SCREEN_PATHS.sprint,
  SCREEN_PATHS.board,
]);
