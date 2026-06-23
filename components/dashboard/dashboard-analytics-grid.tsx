"use client";

import Link from "next/link";
import { ChartLegend } from "@/components/dashboard/chart-legend";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MonthlyCompletionChart } from "@/components/dashboard/monthly-completion-chart";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { TeamStandupPanel } from "@/components/standup/team-standup-panel";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import type { DashboardAnalytics, TeamStandupOverview } from "@/lib/api/types";

export function DashboardAnalyticsGrid({ analytics }: { analytics: DashboardAnalytics }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analytics.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-base font-semibold text-slate-900">Project Status Distribution</h2>
          <p className="mt-0.5 text-sm text-slate-500">Breakdown by current status</p>
          <div className="mt-4">
            <StatusDonutChart data={analytics.statusDistribution} />
            <ChartLegend items={analytics.statusDistribution} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-base font-semibold text-slate-900">Monthly Project Completion</h2>
          <p className="mt-0.5 text-sm text-slate-500">Projects completed per month</p>
          <div className="mt-4">
            <MonthlyCompletionChart data={analytics.monthlyCompletions} />
          </div>
        </div>
      </div>
    </>
  );
}

export function DashboardTeamStandups({
  loading,
  overview,
}: {
  loading: boolean;
  overview?: TeamStandupOverview;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Team Standups Today</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Scrum Master view — daily responses from your team
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-indigo-600" asChild>
          <Link href="/standup/">View all</Link>
        </Button>
      </div>
      {loading && <LoadingState />}
      {overview && <TeamStandupPanel overview={overview} compact />}
    </section>
  );
}
