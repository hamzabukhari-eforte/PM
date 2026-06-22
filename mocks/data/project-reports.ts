import type {
  AssigneeWorkloadPoint,
  BurndownPoint,
  CumulativeFlowPoint,
  MilestoneProgressPoint,
  PlanTask,
  ProjectReportsSummary,
  RiskIndicator,
  SprintHealthPoint,
  StandupParticipationPoint,
  StatusDistributionPoint,
  Task,
  TaskStatus,
  TimeInStatusPoint,
  VelocityPoint,
} from "@/lib/api/types";
import { countAllSubtasks, countCompletedSubtasks } from "@/lib/utils/task-hierarchy";
import {
  boards,
  getAllTasks,
  projectMembers,
  projects,
  sprints,
  standupEntries,
} from "./seed";
import { projectPlans } from "./project-plans";

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "#94a3b8",
  in_progress: "#6366f1",
  review: "#f59e0b",
  done: "#10b981",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  done: "Done",
};

function projectTasks(projectId: string): Task[] {
  return getAllTasks().filter(
    (t) => t.projectId === projectId && t.kind === "project" && !t.archived,
  );
}

function sprintTasks(sprintId: string): Task[] {
  const cols = boards[sprintId];
  if (!cols) return [];
  return cols.flatMap((c) => c.tasks).filter((t) => !t.archived);
}

function flattenPlan(nodes: PlanTask[]): PlanTask[] {
  const out: PlanTask[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.subtasks?.length) out.push(...flattenPlan(n.subtasks));
  }
  return out;
}

function daysBetween(start: string | null | undefined, end: string | null | undefined): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return Math.max(0, Math.ceil((e.getTime() - Date.now()) / 86400000));
}

function buildBurndown(sprintId: string, tasks: Task[]): BurndownPoint[] {
  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0) || tasks.length * 3;
  const donePoints = tasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const remaining = Math.max(totalPoints - donePoints, 0);
  const points: BurndownPoint[] = [];
  for (let i = 0; i <= 10; i++) {
    const ideal = totalPoints - (totalPoints / 10) * i;
    const drift = i <= 6 ? i * 0.8 : (10 - i) * 1.2;
    const actual = Math.max(0, Math.min(totalPoints, remaining + drift * (totalPoints / 20)));
    points.push({
      date: `Day ${i}`,
      ideal: Math.round(ideal * 10) / 10,
      actual: Math.round((i === 10 ? remaining : actual) * 10) / 10,
    });
  }
  void sprintId;
  return points;
}

function buildCumulativeFlow(tasks: Task[]): CumulativeFlowPoint[] {
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((date, i) => {
    const factor = (i + 1) / days.length;
    return {
      date,
      todo: Math.max(0, Math.round(counts.todo + (1 - factor) * 2)),
      inProgress: Math.max(0, Math.round(counts.in_progress * (0.6 + factor * 0.4))),
      review: Math.max(0, Math.round(counts.review * factor)),
      done: Math.max(0, Math.round(counts.done * factor)),
    };
  });
}

function buildVelocity(projectId: string): VelocityPoint[] {
  const projectSprints = sprints.filter((s) => s.projectId === projectId);
  return projectSprints.slice(-6).map((s) => {
    const tasks = sprintTasks(s.id);
    const committed = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 3), 0);
    const completed = tasks
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + (t.storyPoints ?? 3), 0);
    return {
      sprintName: s.name.replace(/^Sprint \d+ — /, "S").slice(0, 12),
      committed: committed || 12,
      completed: completed || (s.status === "closed" ? committed : Math.round(committed * 0.65)),
    };
  });
}

function buildStandupParticipation(projectId: string): StandupParticipationPoint[] {
  const members = projectMembers[projectId]?.length ?? 3;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const entries = standupEntries.filter((s) => s.projectIds.includes(projectId));
  return days.map((day, i) => ({
    day,
    submitted: Math.min(members, Math.max(1, entries.length - i)),
    expected: members,
  }));
}

function buildRisks(
  tasks: Task[],
  velocity: VelocityPoint[],
  standupRate: number,
  daysRemaining: number | null,
): RiskIndicator[] {
  const risks: RiskIndicator[] = [];
  const inReview = tasks.filter((t) => t.status === "review").length;
  const blockedStandups = standupEntries.filter(
    (s) => s.blockers && s.blockers.toLowerCase() !== "none",
  ).length;

  if (velocity.length >= 2) {
    const last = velocity[velocity.length - 1]!;
    const prev = velocity[velocity.length - 2]!;
    if (last.completed < prev.completed * 0.85) {
      risks.push({
        id: "velocity-drop",
        severity: "high",
        title: "Velocity declining",
        detail: `Last sprint delivered ${last.completed} pts vs ${prev.completed} pts previously.`,
      });
    }
  }

  if (inReview >= 2) {
    risks.push({
      id: "review-bottleneck",
      severity: "medium",
      title: "Review bottleneck",
      detail: `${inReview} tasks waiting in review — may delay sprint completion.`,
    });
  }

  if (standupRate < 0.7) {
    risks.push({
      id: "standup-gap",
      severity: "medium",
      title: "Low standup participation",
      detail: "Team standup rate is below 70% this week.",
    });
  }

  if (blockedStandups > 0) {
    risks.push({
      id: "blockers",
      severity: "high",
      title: "Active blockers reported",
      detail: `${blockedStandups} recent standup(s) mention blockers needing resolution.`,
    });
  }

  if (daysRemaining !== null && daysRemaining < 14) {
    const doneRatio = tasks.filter((t) => t.status === "done").length / Math.max(tasks.length, 1);
    if (doneRatio < 0.6) {
      risks.push({
        id: "timeline",
        severity: "high",
        title: "Timeline at risk",
        detail: `Only ${Math.round(doneRatio * 100)}% complete with ${daysRemaining} days left.`,
      });
    }
  }

  if (risks.length === 0) {
    risks.push({
      id: "healthy",
      severity: "low",
      title: "Project health looks good",
      detail: "No critical risks detected from velocity, standups, or timeline signals.",
    });
  }

  return risks;
}

export function buildProjectReportsSummary(
  projectId: string,
  sprintId?: string,
): ProjectReportsSummary | null {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const tasks = projectTasks(projectId);
  const projectSprints = sprints.filter((s) => s.projectId === projectId);
  const activeSprint =
    projectSprints.find((s) => s.id === sprintId) ??
    projectSprints.find((s) => s.status === "active") ??
    projectSprints[0];
  const sprintTaskList = activeSprint ? sprintTasks(activeSprint.id) : tasks;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const donePoints = tasks
    .filter((t) => t.status === "done")
    .reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const progressPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  let subtasksTotal = 0;
  let subtasksCompleted = 0;
  for (const t of tasks) {
    subtasksTotal += countAllSubtasks(t);
    subtasksCompleted += countCompletedSubtasks(t);
  }

  const plan = projectPlans[projectId];
  const planNodes = plan ? flattenPlan(plan.nodes) : [];
  const milestones = planNodes.filter((n) => n.isMilestone);

  const statusOrder: TaskStatus[] = ["todo", "in_progress", "review", "done"];
  const taskStatusDistribution: StatusDistributionPoint[] = statusOrder.map((status) => ({
    name: STATUS_LABELS[status],
    value: tasks.filter((t) => t.status === status).length,
    color: STATUS_COLORS[status],
  }));

  const storyPointsByStatus: StatusDistributionPoint[] = statusOrder.map((status) => ({
    name: STATUS_LABELS[status],
    value: tasks.filter((t) => t.status === status).reduce((s, t) => s + (t.storyPoints ?? 0), 0),
    color: STATUS_COLORS[status],
  }));

  const assigneeMap = new Map<string, AssigneeWorkloadPoint>();
  for (const t of tasks) {
    const name = t.assigneeName ?? "Unassigned";
    const cur = assigneeMap.get(name) ?? {
      name,
      totalTasks: 0,
      doneTasks: 0,
      storyPoints: 0,
      donePoints: 0,
    };
    cur.totalTasks += 1;
    cur.storyPoints += t.storyPoints ?? 0;
    if (t.status === "done") {
      cur.doneTasks += 1;
      cur.donePoints += t.storyPoints ?? 0;
    }
    assigneeMap.set(name, cur);
  }
  const assigneeWorkload = [...assigneeMap.values()].sort((a, b) => b.storyPoints - a.storyPoints);

  const sprintHealth: SprintHealthPoint[] = projectSprints.map((s) => {
    const st = sprintTasks(s.id);
    const stDone = st.filter((t) => t.status === "done").length;
    const stTotal = st.length;
    const spTotal = st.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const spDone = st
      .filter((t) => t.status === "done")
      .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    return {
      sprintId: s.id,
      sprintName: s.name,
      status: s.status,
      progressPercent: stTotal ? Math.round((stDone / stTotal) * 100) : 0,
      tasksDone: stDone,
      tasksTotal: stTotal,
      storyPointsDone: spDone,
      storyPointsTotal: spTotal,
    };
  });

  const milestoneProgress: MilestoneProgressPoint[] = planNodes.slice(0, 8).map((node) => ({
    code: node.code,
    title: node.title,
    percent: node.isMilestone ? 45 : Math.min(100, 20 + node.code.length * 15),
    isMilestone: node.isMilestone,
    dueDate: node.timelineEnd,
  }));

  const timeInStatus: TimeInStatusPoint[] = [
    { status: "todo", label: "To do", avgHours: 18 },
    { status: "in_progress", label: "In progress", avgHours: 26 },
    { status: "review", label: "Review", avgHours: 8 },
    { status: "done", label: "Done", avgHours: 0 },
  ];

  const members = projectMembers[projectId]?.length ?? project.memberCount;
  const standup = buildStandupParticipation(projectId);
  const standupRate =
    standup.reduce((s, d) => s + d.submitted / Math.max(d.expected, 1), 0) / standup.length;
  const daysRemaining = daysBetween(project.startDate, project.endDate);
  const velocity = buildVelocity(projectId);

  const kpis: ProjectReportsSummary["kpis"] = [
    {
      id: "progress",
      label: "Overall progress",
      value: `${progressPct}%`,
      subtext: `${doneTasks} of ${totalTasks} tasks done`,
      tone: progressPct >= 60 ? "green" : progressPct >= 30 ? "orange" : "red",
    },
    {
      id: "story-points",
      label: "Story points",
      value: `${donePoints}/${totalPoints}`,
      subtext: "Delivered vs total",
      tone: "violet",
    },
    {
      id: "subtasks",
      label: "Subtasks",
      value: `${subtasksCompleted}/${subtasksTotal}`,
      subtext: "Completed across all tasks",
      tone: "blue",
    },
    {
      id: "sprints",
      label: "Active sprints",
      value: String(project.activeSprintCount),
      subtext: `${projectSprints.length} total sprints`,
      tone: "slate",
    },
    {
      id: "team",
      label: "Team size",
      value: String(members),
      subtext: "Project members",
      tone: "slate",
    },
    {
      id: "timeline",
      label: "Days remaining",
      value: daysRemaining !== null ? String(daysRemaining) : "—",
      subtext: project.endDate ? `Due ${project.endDate}` : "No end date",
      tone:
        daysRemaining !== null && daysRemaining < 14
          ? "red"
          : daysRemaining !== null && daysRemaining < 30
            ? "orange"
            : "green",
    },
    {
      id: "standup",
      label: "Standup rate",
      value: `${Math.round(standupRate * 100)}%`,
      subtext: "Last 7 days",
      tone: standupRate >= 0.8 ? "green" : standupRate >= 0.6 ? "orange" : "red",
    },
    {
      id: "plan",
      label: "WBS nodes",
      value: String(planNodes.length),
      subtext: `${milestones.length} milestones in plan`,
      tone: "blue",
    },
  ];

  return {
    projectId,
    projectName: project.name,
    generatedAt: new Date().toISOString(),
    kpis,
    taskStatusDistribution,
    storyPointsByStatus,
    assigneeWorkload,
    cumulativeFlow: buildCumulativeFlow(tasks),
    sprintHealth,
    velocity,
    burndown: buildBurndown(activeSprint?.id ?? "sprint", sprintTaskList),
    milestones: milestoneProgress,
    standupParticipation: standup,
    timeInStatus,
    risks: buildRisks(tasks, velocity, standupRate, daysRemaining),
    planSummary: {
      wbsNodes: planNodes.length,
      milestones: milestones.length,
      boardTasks: totalTasks,
      subtasksTotal,
      subtasksCompleted,
    },
  };
}
