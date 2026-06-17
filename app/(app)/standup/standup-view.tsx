"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { StandupForm } from "@/components/standup/standup-form";
import { StandupHistory } from "@/components/standup/standup-history";
import { TeamStandupPanel } from "@/components/standup/team-standup-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project, StandupEntry, TeamStandupOverview, User } from "@/lib/api/types";
import { useStandupGate } from "@/lib/hooks/use-standup-gate";
import { useStandupSubmit } from "@/lib/hooks/use-standup-submit";
import { useUiStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isScrumMaster } from "@/lib/utils/roles";
import { normalizeStandupEntry } from "@/lib/utils/standup";

export function StandupView() {
  const user = useAuthStore((s) => s.user);
  const activeProjectId = useUiStore((s) => s.activeProjectId);
  const { submitted, todayEntry, standupRequired } = useStandupGate();
  const scrumMaster = isScrumMaster(user?.role);
  const submitMutation = useStandupSubmit();
  const [historyUserId, setHistoryUserId] = useState<string>("all");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient<Project[]>(endpoints.projects.list),
  });

  const teamFilterProjectId = activeProjectId ?? projectsQuery.data?.[0]?.id;

  const teamQuery = useQuery({
    queryKey: ["standup-team-today", teamFilterProjectId],
    queryFn: () =>
      apiClient<TeamStandupOverview>(
        endpoints.standup.teamToday(teamFilterProjectId ?? undefined),
      ),
    enabled: scrumMaster,
  });

  const teamUsersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient<User[]>(endpoints.users.list),
    enabled: scrumMaster,
  });

  const historyQuery = useQuery({
    queryKey: ["standup-history", scrumMaster ? historyUserId : user?.id],
    queryFn: () =>
      apiClient<StandupEntry[]>(
        endpoints.standup.history(
          scrumMaster && historyUserId !== "all" ? { userId: historyUserId } : undefined,
        ),
      ),
    enabled: !!user?.id,
  });

  if (projectsQuery.isLoading) return <LoadingState />;

  return (
    <>
      <AppHeader
        title="Daily Standup"
        description={
          scrumMaster
            ? "Review today's team responses and browse standup history by member."
            : "Submit today's update and view your standup history."
        }
      />
      <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
        {scrumMaster && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Team standups today
            </h2>
            {teamQuery.isLoading && <LoadingState />}
            {teamQuery.data && <TeamStandupPanel overview={teamQuery.data} />}
          </section>
        )}

        {standupRequired && (
          <section>
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Today&apos;s standup</CardTitle>
                  {submitted && <Badge variant="success">Submitted</Badge>}
                </div>
                <p className="text-sm text-slate-500">
                  {submitted
                    ? "Update your answers anytime today."
                    : "No standup yet today — fill in your update below."}
                </p>
              </CardHeader>
              <CardContent>
                {projectsQuery.data && (
                  <StandupForm
                    projects={projectsQuery.data}
                    defaultProjectId={activeProjectId ?? undefined}
                    initialValues={
                      todayEntry
                        ? (() => {
                            const entry = normalizeStandupEntry(todayEntry);
                            return {
                              projectIds: entry.projectIds,
                              yesterday: entry.yesterday,
                              today: entry.today,
                              blockers: entry.blockers,
                            };
                          })()
                        : undefined
                    }
                    onSubmit={(data) => submitMutation.mutate(data)}
                    loading={submitMutation.isPending}
                    submitLabel={submitted ? "Save changes" : "Submit standup"}
                  />
                )}
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {scrumMaster ? "Member standup history" : "My history"}
            </h2>
            {scrumMaster && teamUsersQuery.data && (
              <Select value={historyUserId} onValueChange={setHistoryUserId}>
                <SelectTrigger className="h-9 w-full sm:w-[220px] border-slate-200 bg-white">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  {teamUsersQuery.data
                    .filter((member) => member.role === "developer")
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {historyQuery.isLoading && <LoadingState />}
          {historyQuery.data && <StandupHistory entries={historyQuery.data} />}
        </section>
      </div>
    </>
  );
}
