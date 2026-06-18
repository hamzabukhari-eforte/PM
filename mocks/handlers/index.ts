import { http, HttpResponse } from "msw";
import { apiPath } from "@/lib/api/paths";
import type {
  AuthResponse,
  Board,
  BurndownPoint,
  CreateProjectInput,
  CreatePersonalTaskInput,
  CreateSprintInput,
  CreateTaskInput,
  DashboardData,
  InviteInput,
  Project,
  Sprint,
  StandupEntry,
  StandupInput,
  StandupWindow,
  TeamStandupOverview,
  Task,
  UpdateProjectInput,
  UpdateSprintInput,
  UpdateTaskInput,
  User,
  VelocityPoint,
} from "@/lib/api/types";
import { normalizeStandupEntry, standupIncludesProject } from "@/lib/utils/standup";
import { mergeTaskUpdate } from "../data/task-mutations";
import { createBaseTask, createPersonalTask, mapCreateSubtasks, statusFromColumnId } from "../data/task-factory";
import { canMoveTaskToColumn } from "@/lib/utils/task-status-flow";
import { dashboardAnalytics } from "../data/analytics";
import { nextReminderAt } from "@/lib/utils/routine";
import {
  boards,
  cloneBoard,
  getAllTasks,
  passwords,
  personalTasks,
  projectMembers,
  projects,
  sprints,
  standupEntries,
  upsertStandupEntry,
  users,
} from "../data/seed";

function getUserFromToken(request: Request): User | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const userId = token.replace("mock-token-", "");
  return users.find((u) => u.id === userId) ?? null;
}

function requireAuth(request: Request): User | Response {
  const user = getUserFromToken(request);
  if (!user) {
    return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return user;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export const handlers = [
  http.post(apiPath("auth/login"), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const user = users.find((u) => u.email === body.email);
    if (!user || passwords[body.email] !== body.password) {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    const response: AuthResponse = {
      token: `mock-token-${user.id}`,
      user,
    };
    return HttpResponse.json(response);
  }),

  http.get(apiPath("auth/me"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    return HttpResponse.json(user);
  }),

  http.get(apiPath("users"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return HttpResponse.json(users);
  }),

  http.get(apiPath("dashboard"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;

    const myTasks = getAllTasks()
      .filter((t) => t.assigneeId === user.id && t.status !== "done")
      .map((t) => ({
        ...t,
        projectName: t.projectId
          ? projects.find((p) => p.id === t.projectId)?.name ?? null
          : null,
      }));

    const data: DashboardData = {
      myTasks,
      teamPulse: {
        activeSprints: sprints.filter((s) => s.status === "active").length,
        openTasks: getAllTasks().filter((t) => t.status !== "done").length,
        standupsToday: standupEntries.filter((s) => isToday(s.submittedAt)).length,
        teamSize: users.length,
      },
      recentStandups: [...standupEntries]
        .map(normalizeStandupEntry)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        .slice(0, 5),
      analytics: dashboardAnalytics,
    };
    return HttpResponse.json(data);
  }),

  http.get(apiPath("projects"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    return HttpResponse.json(projects.filter((p) => !p.archived));
  }),

  http.post(apiPath("projects"), async ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as CreateProjectInput;
    const id = `proj-${Date.now()}`;
    const project: Project = {
      id,
      name: body.name,
      description: body.description,
      archived: false,
      createdAt: new Date().toISOString(),
      memberCount: 1,
      activeSprintCount: 0,
    };
    projects.push(project);
    projectMembers[id] = [
      { userId: user.id, name: user.name, email: user.email, role: user.role },
    ];
    return HttpResponse.json(project, { status: 201 });
  }),

  http.get(apiPath("projects/:id"), ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const project = projects.find((p) => p.id === params.id);
    if (!project) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(project);
  }),

  http.patch(apiPath("projects/:id"), async ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as UpdateProjectInput;
    const project = projects.find((p) => p.id === params.id);
    if (!project) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    if (body.name !== undefined) project.name = body.name;
    if (body.description !== undefined) project.description = body.description;
    if (body.archived !== undefined) project.archived = body.archived;
    return HttpResponse.json(project);
  }),

  http.get(apiPath("projects/:id/members"), ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    return HttpResponse.json(projectMembers[params.id as string] ?? []);
  }),

  http.post(apiPath("projects/:id/invites"), async ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as InviteInput;
    const members = projectMembers[params.id as string] ?? [];
    const existing = users.find((u) => u.email === body.email);
    const member = {
      userId: existing?.id ?? `user-${Date.now()}`,
      name: existing?.name ?? body.email.split("@")[0],
      email: body.email,
      role: body.role,
    };
    members.push(member);
    projectMembers[params.id as string] = members;
    const project = projects.find((p) => p.id === params.id);
    if (project) project.memberCount = members.length;
    return HttpResponse.json(member, { status: 201 });
  }),

  http.patch(apiPath("projects/:projectId/members/:userId"), async ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as { role: User["role"] };
    const members = projectMembers[params.projectId as string] ?? [];
    const member = members.find((m) => m.userId === params.userId);
    if (!member) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    member.role = body.role;
    return HttpResponse.json(member);
  }),

  http.get(apiPath("projects/:id/sprints"), ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    let result = sprints.filter((s) => s.projectId === params.id);
    if (status) result = result.filter((s) => s.status === status);
    return HttpResponse.json(result);
  }),

  http.post(apiPath("projects/:id/sprints"), async ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as CreateSprintInput;
    const sprint: Sprint = {
      id: `sprint-${Date.now()}`,
      projectId: params.id as string,
      name: body.name,
      goal: body.goal,
      status: body.status ?? "planned",
      startDate: body.startDate,
      endDate: body.endDate,
    };
    sprints.push(sprint);
    boards[sprint.id] = [
      { id: `${sprint.id}-col-todo`, name: "To Do", order: 0, tasks: [] },
      { id: `${sprint.id}-col-progress`, name: "In Progress", order: 1, tasks: [] },
      { id: `${sprint.id}-col-review`, name: "Review", order: 2, tasks: [] },
      { id: `${sprint.id}-col-done`, name: "Done", order: 3, tasks: [] },
    ];
    const project = projects.find((p) => p.id === params.id);
    if (project && sprint.status === "active") {
      project.activeSprintCount += 1;
    }
    return HttpResponse.json(sprint, { status: 201 });
  }),

  http.patch(apiPath("projects/:projectId/sprints/:sprintId"), async ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as UpdateSprintInput;
    const sprint = sprints.find((s) => s.id === params.sprintId);
    if (!sprint) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const prevStatus = sprint.status;
    if (body.name !== undefined) sprint.name = body.name;
    if (body.goal !== undefined) sprint.goal = body.goal;
    if (body.status !== undefined) sprint.status = body.status;
    if (body.startDate !== undefined) sprint.startDate = body.startDate;
    if (body.endDate !== undefined) sprint.endDate = body.endDate;
    const project = projects.find((p) => p.id === params.projectId);
    if (project && body.status && prevStatus !== body.status) {
      if (prevStatus === "active" && body.status !== "active") project.activeSprintCount -= 1;
      if (prevStatus !== "active" && body.status === "active") project.activeSprintCount += 1;
    }
    return HttpResponse.json(sprint);
  }),

  http.get(apiPath("projects/:projectId/sprints/:sprintId/backlog"), ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const board = cloneBoard(params.sprintId as string);
    const todo = board.find((c) => c.name === "To Do");
    return HttpResponse.json(todo?.tasks ?? []);
  }),

  http.get(apiPath("projects/:projectId/sprints/:sprintId/board"), ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const board: Board = {
      sprintId: params.sprintId as string,
      columns: cloneBoard(params.sprintId as string),
    };
    return HttpResponse.json(board);
  }),

  http.patch(apiPath("tasks/:taskId"), async ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const body = (await request.json()) as UpdateTaskInput;
    const taskId = params.taskId as string;

    const personalIdx = personalTasks.findIndex((t) => t.id === taskId);
    if (personalIdx >= 0) {
      const existing = personalTasks[personalIdx];
      if (user.role !== "admin" && existing.assigneeId !== user.id) {
        return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      const updated = mergeTaskUpdate(existing, body);
      if (body.assigneeId) {
        const assignee = users.find((u) => u.id === body.assigneeId);
        updated.assigneeName = assignee?.name ?? null;
      }
      personalTasks[personalIdx] = updated;
      return HttpResponse.json(updated);
    }

    for (const sprintId of Object.keys(boards)) {
      const board = boards[sprintId];
      for (const col of board) {
        const idx = col.tasks.findIndex((t) => t.id === taskId);
        if (idx === -1) continue;

        const task = col.tasks[idx];
        if (body.columnId && body.columnId !== col.id) {
          if (!canMoveTaskToColumn(col.id, body.columnId)) {
            return HttpResponse.json(
              {
                message:
                  "Tasks must move one column at a time: To Do → In Progress → Review → Done",
              },
              { status: 400 },
            );
          }
          col.tasks.splice(idx, 1);
          const targetCol = board.find((c) => c.id === body.columnId);
          if (!targetCol) {
            return HttpResponse.json({ message: "Column not found" }, { status: 404 });
          }
          const updated = mergeTaskUpdate(
            { ...task, columnId: body.columnId, order: body.order ?? targetCol.tasks.length },
            body,
          );
          targetCol.tasks.push(updated);
          targetCol.tasks.sort((a, b) => a.order - b.order);
          return HttpResponse.json(updated);
        }

        const updated = mergeTaskUpdate(task, body);
        if (body.assigneeId !== undefined) {
          const assignee = body.assigneeId
            ? users.find((u) => u.id === body.assigneeId)
            : null;
          updated.assigneeName = assignee?.name ?? null;
        }
        if (body.archived) {
          updated.archived = true;
        }
        col.tasks[idx] = updated;
        col.tasks.sort((a, b) => a.order - b.order);
        return HttpResponse.json(updated);
      }
    }
    return HttpResponse.json({ message: "Task not found" }, { status: 404 });
  }),

  http.get(apiPath("tasks/personal"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind");
    let result = personalTasks.map((t) => ({ ...t }));
    if (user.role !== "admin") {
      result = result.filter((t) => t.assigneeId === user.id);
    }
    if (kind === "miscellaneous" || kind === "routine") {
      result = result.filter((t) => t.kind === kind);
    }
    return HttpResponse.json(result);
  }),

  http.post(apiPath("tasks/personal"), async ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as CreatePersonalTaskInput;
    if (!body.assigneeId) {
      return HttpResponse.json({ message: "assigneeId is required" }, { status: 400 });
    }
    const assignee = users.find((u) => u.id === body.assigneeId);
    if (!assignee) {
      return HttpResponse.json({ message: "Assignee not found" }, { status: 400 });
    }
    const task = createPersonalTask(
      `pt-${Date.now()}`,
      body.kind,
      body.title,
      "todo",
      assignee.id,
      assignee.name,
      body.recurrenceInterval,
      body.storyPoints,
    );
    task.description = body.description ?? "";
    task.timelineStart = body.timelineStart;
    task.timelineEnd = body.timelineEnd;
    if (body.kind === "routine" && body.recurrenceInterval) {
      task.nextReminderAt = nextReminderAt(body.recurrenceInterval);
    }
    personalTasks.push(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.post(apiPath("projects/:projectId/sprints/:sprintId/tasks"), async ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const body = (await request.json()) as CreateTaskInput;
    const board = boards[params.sprintId as string];
    if (!board) return HttpResponse.json({ message: "Sprint not found" }, { status: 404 });
    if (!body.columnId) {
      return HttpResponse.json({ message: "columnId is required" }, { status: 400 });
    }
    const col = board.find((c) => c.id === body.columnId);
    if (!col) return HttpResponse.json({ message: "Column not found" }, { status: 404 });
    const assignee = body.assigneeId ? users.find((u) => u.id === body.assigneeId) : null;
    const subtasks = body.subtasks?.length
      ? mapCreateSubtasks(body.subtasks, Date.now())
      : [];

    const newTask: Task = createBaseTask({
      id: `t-${Date.now()}`,
      kind: "project",
      projectId: params.projectId as string,
      sprintId: params.sprintId as string,
      columnId: body.columnId,
      title: body.title,
      description: body.description ?? "",
      status: statusFromColumnId(body.columnId),
      order: col.tasks.length,
      assigneeId: body.assigneeId ?? null,
      assigneeName: assignee?.name ?? null,
      storyPoints: body.storyPoints ?? null,
      subtasks,
    });
    col.tasks.push(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.get(apiPath("standup/window"), () => {
    const data: StandupWindow = {
      startHour: 0,
      endHour: Number(process.env.NEXT_PUBLIC_STANDUP_END_HOUR ?? 10),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    return HttpResponse.json(data);
  }),

  http.get(apiPath("standup/today"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const entry = standupEntries.find(
      (s) => s.userId === user.id && isToday(s.submittedAt),
    );
    return HttpResponse.json(entry ? normalizeStandupEntry(entry) : null);
  }),

  http.get(apiPath("standup/today/team"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role !== "admin") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const project = projectId ? projects.find((p) => p.id === projectId) : null;

    let memberList: { userId: string; name: string; email: string }[] = [];
    if (projectId) {
      memberList = (projectMembers[projectId] ?? []).map((m) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
      }));
    } else {
      const seen = new Set<string>();
      for (const members of Object.values(projectMembers)) {
        for (const m of members) {
          if (!seen.has(m.userId)) {
            seen.add(m.userId);
            memberList.push({ userId: m.userId, name: m.name, email: m.email });
          }
        }
      }
    }

    const todayEntries = standupEntries
      .filter((s) => isToday(s.submittedAt))
      .map(normalizeStandupEntry);
    const filteredEntries = projectId
      ? todayEntries.filter((s) => standupIncludesProject(s, projectId))
      : todayEntries;

    const overview: TeamStandupOverview = {
      date: new Date().toISOString().slice(0, 10),
      projectId: projectId ?? null,
      projectName: project?.name ?? null,
      members: memberList.map((m) => {
        const entry =
          filteredEntries.find((s) => s.userId === m.userId) ??
          todayEntries.find((s) => s.userId === m.userId) ??
          null;
        return {
          userId: m.userId,
          userName: m.name,
          email: m.email,
          submitted: !!entry,
          entry,
        };
      }),
    };

    return HttpResponse.json(overview);
  }),

  http.post(apiPath("standup"), async ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    if (user.role === "admin") {
      return HttpResponse.json(
        { message: "Admin / Scrum Master accounts do not submit standups" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as StandupInput;
    if (!body.projectIds?.length) {
      return HttpResponse.json({ message: "At least one project is required" }, { status: 400 });
    }
    const selectedProjects = body.projectIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p);
    const entry: StandupEntry = {
      id: `su-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      projectIds: selectedProjects.map((p) => p.id),
      projectNames: selectedProjects.map((p) => p.name),
      yesterday: body.yesterday,
      today: body.today,
      blockers: body.blockers,
      submittedAt: new Date().toISOString(),
    };
    upsertStandupEntry(entry, user.id, isToday);
    return HttpResponse.json(normalizeStandupEntry(entry), { status: 201 });
  }),

  http.get(apiPath("standup/history"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const userId = url.searchParams.get("userId");
    let result = standupEntries.map(normalizeStandupEntry);
    if (user.role !== "admin") {
      result = result.filter((s) => s.userId === user.id);
    } else if (userId) {
      result = result.filter((s) => s.userId === userId);
    }
    if (projectId) {
      result = result.filter((s) => standupIncludesProject(s, projectId));
    }
    return HttpResponse.json(result.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
  }),

  http.get(apiPath("projects/:id/reports/burndown"), ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const url = new URL(request.url);
    const sprintId = url.searchParams.get("sprintId") ?? "sprint-1a";
    const sprint = sprints.find((s) => s.id === sprintId);
    const points: BurndownPoint[] = [];
    const total = 40;
    for (let i = 0; i <= 10; i++) {
      points.push({
        date: `Day ${i}`,
        ideal: total - (total / 10) * i,
        actual: total - (total / 10) * i + (i % 3) * 2,
      });
    }
    void sprint;
    void params;
    return HttpResponse.json(points);
  }),

  http.get(apiPath("projects/:id/reports/velocity"), ({ request }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const data: VelocityPoint[] = [
      { sprintName: "Sprint 9", completed: 28, committed: 32 },
      { sprintName: "Sprint 10", completed: 35, committed: 34 },
      { sprintName: "Sprint 11", completed: 30, committed: 36 },
      { sprintName: "Sprint 12", completed: 22, committed: 40 },
    ];
    return HttpResponse.json(data);
  }),

  http.get(apiPath("projects/:id/reports/standups"), ({ request, params }) => {
    const user = requireAuth(request);
    if (user instanceof Response) return user;
    const result = standupEntries
      .map(normalizeStandupEntry)
      .filter((s) => standupIncludesProject(s, params.id as string));
    return HttpResponse.json(result);
  }),
];
