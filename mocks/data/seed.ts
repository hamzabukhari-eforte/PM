import type {
  BoardColumn,
  Project,
  ProjectMember,
  Sprint,
  StandupEntry,
  Task,
  User,
} from "@/lib/api/types";
import { createPersonalTask, createProjectTask } from "./task-factory";

export const users: User[] = [
  {
    id: "user-admin",
    name: "Alex Chen",
    email: "admin@agileflow.com",
    role: "admin",
  },
  {
    id: "user-dev",
    name: "Dana Developer",
    email: "dev@agileflow.com",
    role: "developer",
  },
  {
    id: "user-dev2",
    name: "Sam Smith",
    email: "sam@agileflow.com",
    role: "developer",
  },
];

export const passwords: Record<string, string> = {
  "admin@agileflow.com": "admin123",
  "dev@agileflow.com": "dev123",
  "sam@agileflow.com": "dev123",
};

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "AgileFlow Platform",
    description: "Core product delivery for the AgileFlow MVP.",
    archived: false,
    createdAt: "2026-01-15T00:00:00Z",
    memberCount: 3,
    activeSprintCount: 2,
  },
  {
    id: "proj-2",
    name: "Mobile Companion",
    description: "Mobile app for standups and task updates on the go.",
    archived: false,
    createdAt: "2026-02-01T00:00:00Z",
    memberCount: 2,
    activeSprintCount: 1,
  },
  {
    id: "proj-3",
    name: "Legacy Migration",
    description: "Migrate legacy project data into AgileFlow.",
    archived: false,
    createdAt: "2026-03-10T00:00:00Z",
    memberCount: 2,
    activeSprintCount: 1,
  },
];

export const projectMembers: Record<string, ProjectMember[]> = {
  "proj-1": [
    { userId: "user-admin", name: "Alex Chen", email: "admin@agileflow.com", role: "admin" },
    { userId: "user-dev", name: "Dana Developer", email: "dev@agileflow.com", role: "developer" },
    { userId: "user-dev2", name: "Sam Smith", email: "sam@agileflow.com", role: "developer" },
  ],
  "proj-2": [
    { userId: "user-admin", name: "Alex Chen", email: "admin@agileflow.com", role: "admin" },
    { userId: "user-dev", name: "Dana Developer", email: "dev@agileflow.com", role: "developer" },
  ],
  "proj-3": [
    { userId: "user-admin", name: "Alex Chen", email: "admin@agileflow.com", role: "admin" },
    { userId: "user-dev2", name: "Sam Smith", email: "sam@agileflow.com", role: "developer" },
  ],
};

export const sprints: Sprint[] = [
  {
    id: "sprint-1a",
    projectId: "proj-1",
    name: "Sprint 12 — Auth & Shell",
    goal: "Deliver authentication and app shell.",
    status: "active",
    startDate: "2026-06-02",
    endDate: "2026-06-13",
  },
  {
    id: "sprint-1b",
    projectId: "proj-1",
    name: "Sprint 13 — Kanban",
    goal: "Ship Kanban board with drag-and-drop.",
    status: "active",
    startDate: "2026-06-09",
    endDate: "2026-06-20",
  },
  {
    id: "sprint-1c",
    projectId: "proj-1",
    name: "Sprint 14 — Reports",
    goal: "Burndown and velocity charts.",
    status: "planned",
    startDate: "2026-06-16",
    endDate: "2026-06-27",
  },
  {
    id: "sprint-2a",
    projectId: "proj-2",
    name: "Sprint 3 — Mobile MVP",
    goal: "Standup form on mobile.",
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-06-14",
  },
  {
    id: "sprint-3a",
    projectId: "proj-3",
    name: "Sprint 1 — Data Import",
    goal: "Import legacy tasks.",
    status: "active",
    startDate: "2026-06-05",
    endDate: "2026-06-18",
  },
];

const defaultColumns = (sprintId: string): BoardColumn[] => [
  {
    id: `${sprintId}-col-todo`,
    name: "To Do",
    order: 0,
    tasks: [],
  },
  {
    id: `${sprintId}-col-progress`,
    name: "In Progress",
    order: 1,
    tasks: [],
  },
  {
    id: `${sprintId}-col-review`,
    name: "Review",
    order: 2,
    tasks: [],
  },
  {
    id: `${sprintId}-col-done`,
    name: "Done",
    order: 3,
    tasks: [],
  },
];

export const personalTasks: Task[] = [
  createPersonalTask(
    "pt-1",
    "miscellaneous",
    "Renew SSL certificates",
    "todo",
    "user-dev",
    "Dana Developer",
    undefined,
    2,
    new Date(Date.now() + 2 * 86400000).toISOString(),
    new Date(Date.now() + 5 * 86400000).toISOString(),
  ),
  createPersonalTask(
    "pt-2",
    "miscellaneous",
    "Update team wiki onboarding doc",
    "in_progress",
    "user-dev2",
    "Sam Smith",
    undefined,
    1,
    new Date(Date.now() - 86400000).toISOString(),
    new Date(Date.now() + 86400000).toISOString(),
  ),
  createPersonalTask(
    "pt-3",
    "routine",
    "Weekly dependency audit",
    "todo",
    "user-dev",
    "Dana Developer",
    "week",
    3,
    new Date(Date.now() + 86400000).toISOString(),
    new Date(Date.now() + 3 * 86400000).toISOString(),
  ),
  createPersonalTask(
    "pt-4",
    "routine",
    "Daily standup prep notes",
    "in_progress",
    "user-dev2",
    "Sam Smith",
    "day",
    1,
    new Date().toISOString(),
    new Date(Date.now() + 3600000).toISOString(),
  ),
];

export const boards: Record<string, BoardColumn[]> = {
  "sprint-1a": [
    {
      ...defaultColumns("sprint-1a")[0],
      tasks: [
        createProjectTask("t-1", "proj-1", "sprint-1a", "sprint-1a-col-todo", "JWT refresh flow", "todo", 0, "user-dev", "Dana Developer", 3, {
          subtasks: [
            { id: "st-1-1", title: "Task A", description: "Review token expiry handling in the auth middleware.", order: 0, linkedTaskId: null, completed: true, subtasks: [
              { id: "st-1-1-1", title: "Inspect middleware chain", description: "Trace refresh token path through existing middleware.", order: 0, linkedTaskId: null, completed: true, subtasks: [] },
              { id: "st-1-1-2", title: "Validate expiry edge cases", description: "Cover clock skew and near-expiry tokens.", order: 1, linkedTaskId: null, completed: false, subtasks: [
                { id: "st-1-1-2-1", title: "Add skew tolerance test", description: "Simulate ±30s client clock drift.", order: 0, linkedTaskId: null, completed: false, subtasks: [] },
              ] },
            ] },
            { id: "st-1-2", title: "Task B", description: "Coordinate with Role guard work — shared session edge cases.", order: 1, linkedTaskId: "st-2-4", completed: false, subtasks: [] },
            { id: "st-1-3", title: "Task C", description: "Add integration tests for refresh rotation.", order: 2, linkedTaskId: null, completed: false, subtasks: [] },
          ],
        }),
        createProjectTask("t-2", "proj-1", "sprint-1a", "sprint-1a-col-todo", "Role guard components", "todo", 1, "user-dev2", "Sam Smith", 2, {
          subtasks: [
            { id: "st-2-1", title: "Audit routes", description: "List all protected routes and current guard coverage.", order: 0, linkedTaskId: null, completed: false, subtasks: [] },
            { id: "st-2-2", title: "Map roles", description: "Document admin vs developer permissions matrix.", order: 1, linkedTaskId: null, completed: false, subtasks: [] },
            { id: "st-2-3", title: "Write guards", description: "Implement route-level guard components.", order: 2, linkedTaskId: null, completed: false, subtasks: [] },
            { id: "st-2-4", title: "Task F", description: "Final verification pass for cross-task dependencies.", order: 3, linkedTaskId: null, completed: false, subtasks: [] },
          ],
        }),
      ],
    },
    {
      ...defaultColumns("sprint-1a")[1],
      tasks: [
        createProjectTask("t-3", "proj-1", "sprint-1a", "sprint-1a-col-progress", "Login page UI", "in_progress", 0, "user-dev", "Dana Developer", 5),
      ],
    },
    {
      ...defaultColumns("sprint-1a")[2],
      tasks: [],
    },
    {
      ...defaultColumns("sprint-1a")[3],
      tasks: [
        createProjectTask("t-4", "proj-1", "sprint-1a", "sprint-1a-col-done", "App shell layout", "done", 0, "user-admin", "Alex Chen", 8),
      ],
    },
  ],
  "sprint-1b": [
    {
      ...defaultColumns("sprint-1b")[0],
      tasks: [
        createProjectTask("t-5", "proj-1", "sprint-1b", "sprint-1b-col-todo", "DnD column reorder", "todo", 0, "user-dev", "Dana Developer", 5),
      ],
    },
    {
      ...defaultColumns("sprint-1b")[1],
      tasks: [
        createProjectTask("t-6", "proj-1", "sprint-1b", "sprint-1b-col-progress", "Kanban card component", "in_progress", 0, "user-dev2", "Sam Smith", 3),
      ],
    },
    { ...defaultColumns("sprint-1b")[2], tasks: [] },
    { ...defaultColumns("sprint-1b")[3], tasks: [] },
  ],
  "sprint-2a": [
    {
      ...defaultColumns("sprint-2a")[0],
      tasks: [
        createProjectTask("t-7", "proj-2", "sprint-2a", "sprint-2a-col-todo", "Mobile standup form", "todo", 0, "user-dev", "Dana Developer", 5),
      ],
    },
    { ...defaultColumns("sprint-2a")[1], tasks: [] },
    { ...defaultColumns("sprint-2a")[2], tasks: [] },
    { ...defaultColumns("sprint-2a")[3], tasks: [] },
  ],
  "sprint-3a": [
    {
      ...defaultColumns("sprint-3a")[0],
      tasks: [
        createProjectTask("t-8", "proj-3", "sprint-3a", "sprint-3a-col-todo", "CSV import parser", "todo", 0, "user-dev2", "Sam Smith", 8),
      ],
    },
    { ...defaultColumns("sprint-3a")[1], tasks: [] },
    { ...defaultColumns("sprint-3a")[2], tasks: [] },
    { ...defaultColumns("sprint-3a")[3], tasks: [] },
  ],
};

const todayMorning = () => {
  const d = new Date();
  d.setHours(8, 30, 0, 0);
  return d.toISOString();
};

export const standupEntries: StandupEntry[] = [
  {
    id: "su-1",
    userId: "user-admin",
    userName: "Alex Chen",
    projectIds: ["proj-1"],
    projectNames: ["AgileFlow Platform"],
    yesterday: "Reviewed sprint goals with the team.",
    today: "Finalize auth API contract.",
    blockers: "None",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "su-2",
    userId: "user-dev",
    userName: "Dana Developer",
    projectIds: ["proj-1", "proj-2"],
    projectNames: ["AgileFlow Platform", "Mobile Companion"],
    yesterday: "Finished login page UI and role guards.",
    today: "Wire up Kanban drag-and-drop persistence.",
    blockers: "Waiting on API contract review.",
    submittedAt: todayMorning(),
  },
];

export function upsertStandupEntry(entry: StandupEntry, userId: string, isToday: (iso: string) => boolean) {
  const idx = standupEntries.findIndex(
    (s) => s.userId === userId && isToday(s.submittedAt),
  );
  if (idx >= 0) standupEntries.splice(idx, 1);
  standupEntries.push(entry);
}

export function getAllTasks(): Task[] {
  return [
    ...Object.values(boards).flatMap((cols) => cols.flatMap((c) => c.tasks)),
    ...personalTasks,
  ];
}

export function findTaskById(taskId: string): Task | null {
  for (const cols of Object.values(boards)) {
    for (const col of cols) {
      const found = col.tasks.find((t) => t.id === taskId);
      if (found) return found;
    }
  }
  return personalTasks.find((t) => t.id === taskId) ?? null;
}

export function cloneBoard(sprintId: string): BoardColumn[] {
  const board = boards[sprintId];
  if (!board) return [];
  return board.map((col) => ({
    ...col,
    tasks: col.tasks
      .filter((t) => !t.archived)
      .map((t) => ({
        ...t,
        subtasks: t.subtasks?.map((s) => ({ ...s })),
      })),
  }));
}
