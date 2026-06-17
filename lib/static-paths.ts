/** IDs pre-rendered at build time for static export. Extend when backend IDs are known. */
export const STATIC_PROJECT_IDS = ["proj-1", "proj-2", "proj-3", "placeholder"];

export const STATIC_SPRINT_IDS = [
  "sprint-1a",
  "sprint-1b",
  "sprint-1c",
  "sprint-2a",
  "sprint-3a",
  "placeholder",
];

export function projectStaticParams() {
  return STATIC_PROJECT_IDS.map((projectId) => ({ projectId }));
}

export function sprintStaticParams() {
  return STATIC_PROJECT_IDS.flatMap((projectId) =>
    STATIC_SPRINT_IDS.map((sprintId) => ({ projectId, sprintId })),
  );
}
