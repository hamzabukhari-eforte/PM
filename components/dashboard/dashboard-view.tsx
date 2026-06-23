"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardAnalyticsGrid, DashboardTeamStandups } from "@/components/dashboard/dashboard-analytics-grid";
import {
  DashboardActiveProjects,
  DashboardHeader,
  DashboardMyTasks,
  DashboardStandupBanner,
} from "@/components/dashboard/dashboard-sections";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useStandupGate } from "@/lib/hooks/use-standup-gate";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { DashboardData, TeamStandupOverview } from "@/lib/api/types";
import { dashboardAnalytics } from "@/mocks/data/analytics";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { isScrumMaster } from "@/lib/utils/roles";

export function DashboardView() {
  const { blocked, needsStandup } = useStandupGate();
  const user = useAuthStore((s) => s.user);
  const activeProjectId = useUiStore((s) => s.activeProjectId);
  const scrumMaster = isScrumMaster(user?.role);
  const [dateRange, setDateRange] = useState("30");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiClient<DashboardData>(endpoints.dashboard),
    retry: 2,
  });

  const teamQuery = useQuery({
    queryKey: ["standup-team-today", activeProjectId],
    queryFn: () =>
      apiClient<TeamStandupOverview>(
        endpoints.standup.teamToday(activeProjectId ?? undefined),
      ),
    enabled: scrumMaster,
  });

  const analytics = data?.analytics ?? dashboardAnalytics;

  return (
    <div className="min-h-screen">
      <DashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />
      <div className="page-enter w-full space-y-6 p-6 lg:px-8 lg:py-8 xl:px-10">
        <DashboardStandupBanner blocked={blocked} needsStandup={needsStandup} />
        {isLoading && <LoadingState />}
        {isError && (
          <ErrorState
            message="Could not load dashboard data. Using demo analytics below."
            onRetry={() => void refetch()}
          />
        )}
        {!isLoading && (
          <>
            <DashboardAnalyticsGrid analytics={analytics} />
            <DashboardActiveProjects projects={analytics.activeProjects} />
            {scrumMaster && (
              <DashboardTeamStandups loading={teamQuery.isLoading} overview={teamQuery.data} />
            )}
            {data && <DashboardMyTasks tasks={data.myTasks} />}
          </>
        )}
      </div>
    </div>
  );
}
