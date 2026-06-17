import { apiPath } from "@/lib/api/paths";

export const endpoints = {
  base: apiPath(""),
  auth: {
    login: apiPath("auth/login"),
    logout: apiPath("auth/logout"),
    me: apiPath("auth/me"),
  },
  dashboard: apiPath("dashboard"),
  users: {
    list: apiPath("users"),
  },
  projects: {
    list: apiPath("projects"),
    detail: (id: string) => apiPath(`projects/${id}`),
    members: (id: string) => apiPath(`projects/${id}/members`),
    invite: (id: string) => apiPath(`projects/${id}/invites`),
    member: (projectId: string, userId: string) =>
      apiPath(`projects/${projectId}/members/${userId}`),
    sprints: (id: string, status?: string) =>
      apiPath(`projects/${id}/sprints`, status ? `status=${status}` : undefined),
    sprint: (projectId: string, sprintId: string) =>
      apiPath(`projects/${projectId}/sprints/${sprintId}`),
    backlog: (projectId: string, sprintId: string) =>
      apiPath(`projects/${projectId}/sprints/${sprintId}/backlog`),
    board: (projectId: string, sprintId: string) =>
      apiPath(`projects/${projectId}/sprints/${sprintId}/board`),
    tasks: (projectId: string, sprintId: string) =>
      apiPath(`projects/${projectId}/sprints/${sprintId}/tasks`),
    reports: {
      burndown: (id: string, sprintId: string) =>
        apiPath(`projects/${id}/reports/burndown`, `sprintId=${sprintId}`),
      velocity: (id: string) => apiPath(`projects/${id}/reports/velocity`),
      standups: (id: string) => apiPath(`projects/${id}/reports/standups`),
    },
  },
  tasks: {
    update: (id: string) => apiPath(`tasks/${id}`),
    personal: (kind?: "miscellaneous" | "routine") =>
      apiPath("tasks/personal", kind ? `kind=${kind}` : undefined),
  },
  standup: {
    window: apiPath("standup/window"),
    today: apiPath("standup/today"),
    teamToday: (projectId?: string) =>
      apiPath("standup/today/team", projectId ? `projectId=${projectId}` : undefined),
    submit: apiPath("standup"),
    history: (params?: { projectId?: string; userId?: string; from?: string; to?: string }) => {
      const search = new URLSearchParams();
      if (params?.projectId) search.set("projectId", params.projectId);
      if (params?.userId) search.set("userId", params.userId);
      if (params?.from) search.set("from", params.from);
      if (params?.to) search.set("to", params.to);
      const qs = search.toString();
      return apiPath("standup/history", qs || undefined);
    },
  },
};
