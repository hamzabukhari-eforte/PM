/** `admin` = platform admin + Scrum Master (sprints, team, standup oversight). */
export type Role = "admin" | "developer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  archived: boolean;
  createdAt: string;
  memberCount: number;
  activeSprintCount: number;
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  status: "planned" | "active" | "closed";
  startDate: string;
  endDate: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export type TaskKind = "project" | "miscellaneous" | "routine";

export type RecurrenceInterval = "hour" | "day" | "week" | "month" | "year";

/** Child work item on a Kanban main task. Links use stable ids, not display numbers. */
export interface SubTask {
  id: string;
  title: string;
  description: string;
  order: number;
  /** Main task id or another subtask id within the sprint. */
  linkedTaskId: string | null;
  completed: boolean;
  subtasks?: SubTask[];
}

export interface Task {
  id: string;
  kind: TaskKind;
  projectId: string | null;
  sprintId: string | null;
  columnId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  order: number;
  assigneeId: string | null;
  assigneeName: string | null;
  storyPoints: number | null;
  /** Seconds spent in progress before review (accumulated). */
  timeInProgressSeconds: number;
  /** Set while status is in_progress. */
  inProgressSince: string | null;
  /** Routine tasks only — how often to remind the assignee. */
  recurrenceInterval?: RecurrenceInterval | null;
  /** Routine tasks only — next scheduled reminder. */
  nextReminderAt?: string | null;
  /** Personal tasks — planned start of the work window. */
  timelineStart?: string | null;
  /** Personal tasks — planned end of the work window. */
  timelineEnd?: string | null;
  /** Project Kanban main tasks only. */
  subtasks?: SubTask[];
  /** When true, hidden from board/backlog views. */
  archived?: boolean;
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  tasks: Task[];
}

export interface Board {
  sprintId: string;
  columns: BoardColumn[];
}

export interface StandupWindow {
  startHour: number;
  endHour: number;
  timezone: string;
}

export interface StandupEntry {
  id: string;
  userId: string;
  userName: string;
  projectIds: string[];
  projectNames: string[];
  yesterday: string;
  today: string;
  blockers: string;
  submittedAt: string;
}

export interface DashboardTask extends Task {
  projectName: string | null;
}

export interface TeamPulse {
  activeSprints: number;
  openTasks: number;
  standupsToday: number;
  teamSize: number;
}

export type ProjectHealthStatus =
  | "active"
  | "on_track"
  | "in_progress"
  | "on_hold"
  | "at_risk";

export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
  badge: { label: string; tone: "blue" | "green" | "orange" | "red" };
  subtext: string;
  trend?: { direction: "up" | "down"; value: string; positive?: boolean };
  icon: "projects" | "completed" | "active" | "delayed";
}

export interface StatusDistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyCompletionPoint {
  month: string;
  count: number;
}

export interface ActiveProjectSummary {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: ProjectHealthStatus;
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  teamSize: number;
  daysRemaining: number;
}

export interface DashboardAnalytics {
  kpis: DashboardKpi[];
  statusDistribution: StatusDistributionPoint[];
  monthlyCompletions: MonthlyCompletionPoint[];
  activeProjects: ActiveProjectSummary[];
}

export interface DashboardData {
  myTasks: DashboardTask[];
  teamPulse: TeamPulse;
  recentStandups: StandupEntry[];
  analytics: DashboardAnalytics;
}

export interface BurndownPoint {
  date: string;
  ideal: number;
  actual: number;
}

export interface VelocityPoint {
  sprintName: string;
  completed: number;
  committed: number;
}

export interface CreateProjectInput {
  name: string;
  description: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  archived?: boolean;
}

export interface CreateSprintInput {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status?: Sprint["status"];
}

export interface UpdateSprintInput {
  name?: string;
  goal?: string;
  status?: Sprint["status"];
  startDate?: string;
  endDate?: string;
}

export interface CreateSubTaskInput {
  title: string;
  description?: string;
  linkedTaskId?: string | null;
  subtasks?: CreateSubTaskInput[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  columnId: string;
  assigneeId?: string | null;
  storyPoints?: number | null;
  kind?: TaskKind;
  recurrenceInterval?: RecurrenceInterval;
  subtasks?: CreateSubTaskInput[];
}

export interface CreatePersonalTaskInput {
  title: string;
  description?: string;
  assigneeId: string;
  storyPoints?: number | null;
  kind: "miscellaneous" | "routine";
  recurrenceInterval?: RecurrenceInterval;
  timelineStart: string;
  timelineEnd: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  columnId?: string | null;
  order?: number;
  assigneeId?: string | null;
  storyPoints?: number | null;
  recurrenceInterval?: RecurrenceInterval;
  subtasks?: SubTask[];
  archived?: boolean;
}

export interface StandupInput {
  projectIds: string[];
  yesterday: string;
  today: string;
  blockers: string;
}

export interface TeamStandupMember {
  userId: string;
  userName: string;
  email: string;
  submitted: boolean;
  entry: StandupEntry | null;
}

export interface TeamStandupOverview {
  date: string;
  projectId: string | null;
  projectName: string | null;
  members: TeamStandupMember[];
}

export interface InviteInput {
  email: string;
  role: Role;
}
