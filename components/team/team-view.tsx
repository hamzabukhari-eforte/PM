"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/app-header";
import { MemberList } from "@/components/team/member-list";
import { InviteForm } from "@/components/team/invite-form";
import { RoleGuard } from "@/components/auth/role-guard";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProjectMember } from "@/lib/api/types";
import { useResolvedProjectId } from "@/lib/hooks/use-route-ids";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canManageTeam } from "@/lib/utils/roles";

export function TeamView() {
  const projectId = useResolvedProjectId();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["members", projectId],
    queryFn: () => apiClient<ProjectMember[]>(endpoints.projects.members(projectId)),
    enabled: !!projectId,
  });

  const inviteMutation = useMutation({
    mutationFn: (body: { email: string; role: ProjectMember["role"] }) =>
      apiClient(endpoints.projects.invite(projectId), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["members", projectId] }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: ProjectMember["role"] }) =>
      apiClient(endpoints.projects.member(projectId, userId), {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["members", projectId] }),
  });

  return (
    <>
      <AppHeader title="Team" />
      <div className="space-y-6 p-6 lg:p-8">
        <RoleGuard roles={["admin"]}>
          <InviteForm
            onSubmit={(data) => inviteMutation.mutate(data)}
            loading={inviteMutation.isPending}
          />
        </RoleGuard>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => void refetch()} />}
        {!isLoading && !isError && (
          <MemberList
            members={members}
            canEdit={canManageTeam(user?.role)}
            onRoleChange={(userId, role) => roleMutation.mutate({ userId, role })}
          />
        )}
      </div>
    </>
  );
}
