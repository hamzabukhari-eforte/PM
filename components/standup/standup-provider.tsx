"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project } from "@/lib/api/types";
import { StandupRequiredModal } from "@/components/standup/standup-required-modal";
import { useStandupGate } from "@/lib/hooks/use-standup-gate";
import { useStandupSubmit } from "@/lib/hooks/use-standup-submit";
import { useUiStore } from "@/lib/stores/ui-store";

export function StandupProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { needsStandup, loading } = useStandupGate();
  const activeProjectId = useUiStore((s) => s.activeProjectId);
  const submitMutation = useStandupSubmit();
  const onStandupPage = pathname.startsWith("/standup");

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient<Project[]>(endpoints.projects.list),
    enabled: needsStandup && !onStandupPage,
  });

  const showModal = !loading && needsStandup && !onStandupPage;

  return (
    <>
      {children}
      <StandupRequiredModal
        open={showModal}
        projects={projectsQuery.data ?? []}
        defaultProjectId={activeProjectId ?? undefined}
        onSubmit={(data) => submitMutation.mutate(data)}
        loading={submitMutation.isPending}
        projectsLoading={projectsQuery.isLoading}
      />
    </>
  );
}
