"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { BurndownChart } from "@/components/reports/burndown-chart";
import { VelocityChart } from "@/components/reports/velocity-chart";
import { StandupHistory } from "@/components/standup/standup-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { BurndownPoint, Sprint, StandupEntry, VelocityPoint } from "@/lib/api/types";

export function ReportsView() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [sprintId, setSprintId] = useState("");

  const sprintsQuery = useQuery({
    queryKey: ["sprints", projectId, "active"],
    queryFn: () => apiClient<Sprint[]>(endpoints.projects.sprints(projectId, "active")),
    enabled: !!projectId,
  });

  const activeSprintId = sprintId || sprintsQuery.data?.[0]?.id || "sprint-1a";

  const burndownQuery = useQuery({
    queryKey: ["burndown", projectId, activeSprintId],
    queryFn: () =>
      apiClient<BurndownPoint[]>(endpoints.projects.reports.burndown(projectId, activeSprintId)),
    enabled: !!projectId,
  });

  const velocityQuery = useQuery({
    queryKey: ["velocity", projectId],
    queryFn: () => apiClient<VelocityPoint[]>(endpoints.projects.reports.velocity(projectId)),
    enabled: !!projectId,
  });

  const standupsQuery = useQuery({
    queryKey: ["report-standups", projectId],
    queryFn: () => apiClient<StandupEntry[]>(endpoints.projects.reports.standups(projectId)),
    enabled: !!projectId,
  });

  const loading = burndownQuery.isLoading || velocityQuery.isLoading || standupsQuery.isLoading;
  const error = burndownQuery.isError || velocityQuery.isError || standupsQuery.isError;

  return (
    <>
      <AppHeader title="Reports" />
      <div className="space-y-6 p-6 lg:p-8">
        {loading && <LoadingState />}
        {error && (
          <ErrorState
            onRetry={() => {
              void burndownQuery.refetch();
              void velocityQuery.refetch();
              void standupsQuery.refetch();
            }}
          />
        )}
        {!loading && !error && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Burndown</CardTitle>
                {sprintsQuery.data && sprintsQuery.data.length > 0 && (
                  <Select value={activeSprintId} onValueChange={setSprintId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {sprintsQuery.data.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardHeader>
              <CardContent>
                {burndownQuery.data && <BurndownChart data={burndownQuery.data} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Velocity</CardTitle></CardHeader>
              <CardContent>
                {velocityQuery.data && <VelocityChart data={velocityQuery.data} />}
              </CardContent>
            </Card>
            <section>
              <h2 className="mb-4 text-lg font-semibold">Standup history</h2>
              {standupsQuery.data && <StandupHistory entries={standupsQuery.data} />}
            </section>
          </>
        )}
      </div>
    </>
  );
}
