"use client";

import { AssigneeWorkloadChart } from "@/components/reports/assignee-workload-chart";
import { BurndownChart } from "@/components/reports/burndown-chart";
import { ChartLegend } from "@/components/dashboard/chart-legend";
import { CumulativeFlowChart } from "@/components/reports/cumulative-flow-chart";
import { PlanGanttChart } from "@/components/reports/plan-gantt-chart";
import { ProjectReportKpiGrid } from "@/components/reports/project-report-kpi-grid";
import { ReportSection } from "@/components/reports/report-section";
import { RiskIndicatorsPanel } from "@/components/reports/risk-indicators-panel";
import {
  MilestoneProgressPanel,
  SprintHealthPanel,
} from "@/components/reports/sprint-milestone-panels";
import { StandupParticipationChart } from "@/components/reports/standup-participation-chart";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { StoryPointsStatusChart } from "@/components/reports/story-points-status-chart";
import { TimeInStatusChart } from "@/components/reports/time-in-status-chart";
import { VelocityChart } from "@/components/reports/velocity-chart";
import { StandupHistory } from "@/components/standup/standup-history";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import type { ProjectReportsSummary, Sprint, StandupEntry } from "@/lib/api/types";

export function ReportsDashboard({
  report,
  sprints,
  activeSprintId,
  onSprintChange,
  standupsLoading,
  standups,
}: {
  report: ProjectReportsSummary;
  sprints?: Sprint[];
  activeSprintId: string;
  onSprintChange: (id: string) => void;
  standupsLoading: boolean;
  standups?: StandupEntry[];
}) {
  return (
    <>
      <ProjectReportKpiGrid kpis={report.kpis} />

      <ReportSection
        title="Risk & health signals"
        description="Automated flags from velocity, standups, review load, and timeline."
      >
        <RiskIndicatorsPanel risks={report.risks} />
      </ReportSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection title="Task status" description="Where work sits on the board right now.">
          <StatusDonutChart data={report.taskStatusDistribution} />
          <ChartLegend items={report.taskStatusDistribution} />
        </ReportSection>
        <ReportSection title="Story points by status" description="Effort distribution across workflow columns.">
          <StoryPointsStatusChart data={report.storyPointsByStatus} />
        </ReportSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection
          title="Sprint burndown"
          description="Ideal vs actual remaining work for the selected sprint."
          action={
            sprints && sprints.length > 0 ? (
              <Select value={activeSprintId} onValueChange={onSprintChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : undefined
          }
        >
          <BurndownChart data={report.burndown} />
        </ReportSection>
        <ReportSection title="Velocity trend" description="Committed vs completed story points per sprint.">
          <VelocityChart data={report.velocity} />
        </ReportSection>
      </div>

      <ReportSection title="Cumulative flow" description="How work accumulates through To do → Done over the week.">
        <CumulativeFlowChart data={report.cumulativeFlow} />
      </ReportSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection title="Assignee workload" description="Tasks and story points per team member.">
          <AssigneeWorkloadChart data={report.assigneeWorkload} />
        </ReportSection>
        <ReportSection title="Avg time in status" description="How long tasks typically stay in each column (hours).">
          <TimeInStatusChart data={report.timeInStatus} />
        </ReportSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportSection title="Sprint health" description="Progress across all sprints in this project.">
          <SprintHealthPanel sprints={report.sprintHealth} />
        </ReportSection>
        <ReportSection
          title="Plan & milestones"
          description={`WBS: ${report.planSummary.wbsNodes} nodes · ${report.planSummary.milestones} milestones · ${report.planSummary.subtasksCompleted}/${report.planSummary.subtasksTotal} board subtasks done`}
        >
          <MilestoneProgressPanel milestones={report.milestones} />
        </ReportSection>
      </div>

      <ReportSection
        title="Project plan Gantt"
        description="WBS schedule from the project plan — tasks, subtasks, dependencies, and milestones on a shared timeline."
      >
        <PlanGanttChart data={report.planGantt} />
      </ReportSection>

      <ReportSection title="Standup participation" description="Daily submission rate vs expected team size.">
        <StandupParticipationChart data={report.standupParticipation} />
      </ReportSection>

      <ReportSection title="Standup history" description="Recent team updates for this project.">
        {standupsLoading && <LoadingState />}
        {standups && <StandupHistory entries={standups} />}
      </ReportSection>
    </>
  );
}
