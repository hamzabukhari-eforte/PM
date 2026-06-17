"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { SprintList } from "@/components/sprints/sprint-list";
import { SprintForm, type SprintFormData } from "@/components/sprints/sprint-form";
import { RoleGuard } from "@/components/auth/role-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Sprint } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManageSprints } from "@/lib/utils/roles";

export function SprintsView() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("active");

  const { data: sprints = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["sprints", projectId, tab],
    queryFn: () => apiClient<Sprint[]>(endpoints.projects.sprints(projectId, tab)),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: SprintFormData) =>
      apiClient(endpoints.projects.sprints(projectId), {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["sprints", projectId] }),
  });

  const closeMutation = useMutation({
    mutationFn: (sprintId: string) =>
      apiClient(endpoints.projects.sprint(projectId, sprintId), {
        method: "PATCH",
        body: JSON.stringify({ status: "closed" }),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["sprints", projectId] }),
  });

  return (
    <>
      <AppHeader title="Sprints" />
      <div className="space-y-6 p-6 lg:p-8">
        <RoleGuard roles={["admin"]}>
          <SprintForm
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
          />
        </RoleGuard>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="planned">Planned</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>
            {isLoading && <LoadingState />}
            {isError && <ErrorState onRetry={() => void refetch()} />}
            {!isLoading && !isError && sprints.length === 0 && (
              <EmptyState title={`No ${tab} sprints`} />
            )}
            {!isLoading && !isError && sprints.length > 0 && (
              <SprintList
                sprints={sprints}
                projectId={projectId}
                canManage={canManageSprints(user?.role)}
                onClose={(id) => closeMutation.mutate(id)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
