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
  /** Maps to legacy ProjectTitle. */
  name: string;
  /** Maps to legacy pDescription / high-level scope. */
  description: string;
  archived: boolean;
  createdAt: string;
  memberCount: number;
  activeSprintCount: number;
  /** Legacy ProjectCode — auto-generated when saved. */
  projectCode?: string | null;
  brdReceivingDate?: string | null;
  projectTypeId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: string | null;
  initiatedById?: string | null;
  departmentalPocId?: string | null;
  partnerIds?: string[];
  projectStatusId?: string | null;
  projectManagerId?: string | null;
  priorityId?: string | null;
  /** hold | assigned — legacy ProjectAction. */
  projectAction?: "hold" | "assigned" | null;
  assignToId?: string | null;
  taskTemplateId?: string | null;
  isDraft?: boolean;
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
  assigneeIds: string[];
  assigneeNames: string[];
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
  assigneeIds: string[];
  assigneeNames: string[];
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
  /** Optional link to project plan WBS node. */
  planTaskId?: string | null;
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

export interface ProjectReportKpi {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  tone: "blue" | "green" | "orange" | "red" | "slate" | "violet";
}

export interface AssigneeWorkloadPoint {
  name: string;
  totalTasks: number;
  doneTasks: number;
  storyPoints: number;
  donePoints: number;
}

export interface CumulativeFlowPoint {
  date: string;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
}

export interface SprintHealthPoint {
  sprintId: string;
  sprintName: string;
  status: Sprint["status"];
  progressPercent: number;
  tasksDone: number;
  tasksTotal: number;
  storyPointsDone: number;
  storyPointsTotal: number;
}

export interface MilestoneProgressPoint {
  code: string;
  title: string;
  percent: number;
  isMilestone: boolean;
  dueDate: string | null;
}

export interface StandupParticipationPoint {
  day: string;
  submitted: number;
  expected: number;
}

export interface TimeInStatusPoint {
  status: TaskStatus;
  label: string;
  avgHours: number;
}

export interface RiskIndicator {
  id: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}

export interface PlanGanttItem {
  id: string;
  code: string;
  title: string;
  kind: PlanNodeKind;
  depth: number;
  assigneeNames: string[];
  startDate: string;
  endDate: string;
  isMilestone: boolean;
  milestoneNo: string | null;
  dependentTaskCode: string | null;
}

export interface PlanGanttChart {
  rangeStart: string;
  rangeEnd: string;
  items: PlanGanttItem[];
}

export interface ProjectReportsSummary {
  projectId: string;
  projectName: string;
  generatedAt: string;
  kpis: ProjectReportKpi[];
  taskStatusDistribution: StatusDistributionPoint[];
  storyPointsByStatus: StatusDistributionPoint[];
  assigneeWorkload: AssigneeWorkloadPoint[];
  cumulativeFlow: CumulativeFlowPoint[];
  sprintHealth: SprintHealthPoint[];
  velocity: VelocityPoint[];
  burndown: BurndownPoint[];
  milestones: MilestoneProgressPoint[];
  standupParticipation: StandupParticipationPoint[];
  timeInStatus: TimeInStatusPoint[];
  risks: RiskIndicator[];
  planGantt: PlanGanttChart;
  planSummary: {
    wbsNodes: number;
    milestones: number;
    boardTasks: number;
    subtasksTotal: number;
    subtasksCompleted: number;
  };
}

export interface CreateProjectInput {
  name: string;
  description: string;
  projectCode?: string | null;
  brdReceivingDate?: string | null;
  projectTypeId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: string | null;
  initiatedById?: string | null;
  departmentalPocId?: string | null;
  partnerIds?: string[];
  projectStatusId?: string | null;
  projectManagerId?: string | null;
  priorityId?: string | null;
  projectAction?: "hold" | "assigned" | null;
  assignToId?: string | null;
  taskTemplateId?: string | null;
  isDraft?: boolean;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  archived?: boolean;
  projectCode?: string | null;
  brdReceivingDate?: string | null;
  projectTypeId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: string | null;
  initiatedById?: string | null;
  departmentalPocId?: string | null;
  partnerIds?: string[];
  projectStatusId?: string | null;
  projectManagerId?: string | null;
  priorityId?: string | null;
  projectAction?: "hold" | "assigned" | null;
  assignToId?: string | null;
  taskTemplateId?: string | null;
  isDraft?: boolean;
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
  assigneeIds?: string[];
  subtasks?: CreateSubTaskInput[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  columnId: string;
  assigneeIds?: string[];
  storyPoints?: number | null;
  kind?: TaskKind;
  recurrenceInterval?: RecurrenceInterval;
  subtasks?: CreateSubTaskInput[];
}

export interface CreatePersonalTaskInput {
  title: string;
  description?: string;
  assigneeIds: string[];
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
  assigneeIds?: string[];
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

export interface LookupOption {
  id: string;
  label: string;
}

export interface ProjectLookups {
  projectTypes: LookupOption[];
  categories: LookupOption[];
  priorities: LookupOption[];
  projectStatuses: LookupOption[];
  projectActions: LookupOption[];
  initiatedBy: LookupOption[];
  taskStatuses: LookupOption[];
  completionPercents: LookupOption[];
  taskTemplates: LookupOption[];
  forms: LookupOption[];
}

export type PlanNodeKind = "project" | "task" | "subtask";

/** WBS node in the project plan (legacy Project Schedule). */
export interface PlanTask {
  id: string;
  code: string;
  title: string;
  description: string;
  kind: PlanNodeKind;
  order: number;
  assigneeId: string | null;
  memberIds: string[];
  timelineStart: string | null;
  timelineEnd: string | null;
  isDependent: boolean;
  dependentTaskCode: string | null;
  isMilestone: boolean;
  milestoneNo: string | null;
  milestoneDescription: string | null;
  subtasks?: PlanTask[];
}

export interface ProjectPlan {
  projectId: string;
  allowSubtaskCreation: boolean;
  nodes: PlanTask[];
}

export interface PlanTaskInput {
  title: string;
  description?: string;
  assigneeId?: string | null;
  memberIds?: string[];
  timelineStart?: string | null;
  timelineEnd?: string | null;
  isDependent?: boolean;
  dependentTaskCode?: string | null;
  isMilestone?: boolean;
  milestoneNo?: string | null;
  milestoneDescription?: string | null;
  parentId?: string | null;
  subtasks?: PlanTaskInput[];
}

export interface UpdateProjectPlanInput {
  allowSubtaskCreation?: boolean;
  nodes?: PlanTask[];
}

export interface TaskFollowupInput {
  followupStart: string;
  followupEnd: string;
  details: string;
  completionPercent: number;
  taskStatusId: string;
  documentTitle?: string;
  reopenTask?: boolean;
  criticalTask?: boolean;
  customFormValues?: Record<string, string>;
}

export interface TaskFollowupEntry extends TaskFollowupInput {
  id: string;
  taskId: string;
  submittedAt: string;
  submittedByName: string;
}

export interface FollowupFormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  required?: boolean;
  options?: LookupOption[];
}

export interface TaskFollowupContext {
  task: Task;
  projectName: string | null;
  assignByName: string | null;
  formFields: FollowupFormField[];
  latestFollowup: TaskFollowupEntry | null;
}
