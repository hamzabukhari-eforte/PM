import { STATIC_PLACEHOLDER, STATIC_PROJECT_IDS, STATIC_SPRINT_IDS } from "@/lib/static-paths";

function withTrailingSlash(path: string): string {
  if (path.includes("?")) {
    const [pathname, query] = path.split("?");
    const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
    return `${normalized}?${query}`;
  }
  return path.endsWith("/") ? path : `${path}/`;
}

function appendQuery(path: string, query: Record<string, string>): string {
  const params = new URLSearchParams(query);
  const qs = params.toString();
  if (!qs) return withTrailingSlash(path);
  const base = withTrailingSlash(path).replace(/\?.*$/, "");
  return `${base}?${qs}`;
}

/** True when this ID has a prebuilt static HTML page (not the catch-all placeholder). */
export function isKnownProjectId(projectId: string): boolean {
  return STATIC_PROJECT_IDS.includes(projectId) && projectId !== STATIC_PLACEHOLDER;
}

export function isKnownSprintId(sprintId: string): boolean {
  return STATIC_SPRINT_IDS.includes(sprintId) && sprintId !== STATIC_PLACEHOLDER;
}

/**
 * Static-export-safe project URL.
 * Unknown IDs use the prebuilt `/projects/placeholder/` shell with `?id=`.
 */
export function projectHref(projectId: string, rest = ""): string {
  const suffix = rest.replace(/^\/+/, "");
  if (isKnownProjectId(projectId)) {
    return withTrailingSlash(`/projects/${projectId}/${suffix}`);
  }
  return appendQuery(`/projects/${STATIC_PLACEHOLDER}/${suffix}`, { id: projectId });
}

/**
 * Static-export-safe sprint URL.
 * Unknown project/sprint IDs use placeholder path segments + query params.
 */
export function sprintHref(projectId: string, sprintId: string, rest = ""): string {
  const suffix = rest.replace(/^\/+/, "");
  const knownProject = isKnownProjectId(projectId);
  const knownSprint = isKnownSprintId(sprintId);
  const pathProjectId = knownProject ? projectId : STATIC_PLACEHOLDER;
  const pathSprintId = knownSprint ? sprintId : STATIC_PLACEHOLDER;
  const path = `/projects/${pathProjectId}/sprints/${pathSprintId}/${suffix}`;

  const query: Record<string, string> = {};
  if (!knownProject) query.id = projectId;
  if (!knownSprint) query.sprintId = sprintId;
  return Object.keys(query).length ? appendQuery(path, query) : withTrailingSlash(path);
}
