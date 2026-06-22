import type { PlanTask, ProjectPlan } from "@/lib/api/types";

export const projectPlans: Record<string, ProjectPlan> = {
  "proj-1": {
    projectId: "proj-1",
    allowSubtaskCreation: true,
    nodes: [
      {
        id: "plan-1",
        code: "1",
        title: "Authentication module",
        description: "JWT refresh, role guards, and session handling.",
        kind: "task",
        order: 0,
        assigneeId: "user-dev",
        memberIds: ["user-dev", "user-dev2"],
        timelineStart: "2026-06-01T09:00:00",
        timelineEnd: "2026-06-15T17:00:00",
        isDependent: false,
        dependentTaskCode: null,
        isMilestone: false,
        milestoneNo: null,
        milestoneDescription: null,
        subtasks: [
          {
            id: "plan-1-1",
            code: "1.1",
            title: "JWT refresh flow",
            description: "Token rotation and middleware review.",
            kind: "subtask",
            order: 0,
            assigneeId: "user-dev",
            memberIds: ["user-dev"],
            timelineStart: "2026-06-01T09:00:00",
            timelineEnd: "2026-06-08T17:00:00",
            isDependent: false,
            dependentTaskCode: null,
            isMilestone: false,
            milestoneNo: null,
            milestoneDescription: null,
            subtasks: [],
          },
          {
            id: "plan-1-2",
            code: "1.2",
            title: "Role guard components",
            description: "Route-level guards and permission matrix.",
            kind: "subtask",
            order: 1,
            assigneeId: "user-dev2",
            memberIds: ["user-dev2"],
            timelineStart: "2026-06-05T09:00:00",
            timelineEnd: "2026-06-12T17:00:00",
            isDependent: true,
            dependentTaskCode: "1.1",
            isMilestone: false,
            milestoneNo: null,
            milestoneDescription: null,
            subtasks: [],
          },
        ],
      },
      {
        id: "plan-2",
        code: "2",
        title: "UI shell & login",
        description: "App shell layout and login page.",
        kind: "task",
        order: 1,
        assigneeId: "user-dev",
        memberIds: ["user-dev"],
        timelineStart: "2026-06-10T09:00:00",
        timelineEnd: "2026-06-20T17:00:00",
        isDependent: false,
        dependentTaskCode: null,
        isMilestone: true,
        milestoneNo: "M1",
        milestoneDescription: "MVP UI complete",
        subtasks: [],
      },
    ],
  },
};

export const taskFollowups: Record<string, import("@/lib/api/types").TaskFollowupEntry[]> = {
  "t-1": [
    {
      id: "fu-1",
      taskId: "t-1",
      followupStart: "2026-06-10T09:00:00",
      followupEnd: "2026-06-10T12:00:00",
      details: "Reviewed token expiry edge cases in middleware.",
      completionPercent: 40,
      taskStatusId: "ts-working",
      submittedAt: "2026-06-10T12:30:00",
      submittedByName: "Dana Developer",
    },
  ],
};

export function clonePlan(projectId: string): ProjectPlan | null {
  const plan = projectPlans[projectId];
  if (!plan) return null;
  return JSON.parse(JSON.stringify(plan)) as ProjectPlan;
}

export function clonePlanTask(sub: PlanTask): PlanTask {
  return {
    ...sub,
    subtasks: sub.subtasks?.map(clonePlanTask) ?? [],
  };
}
