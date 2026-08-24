"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/lib/stores/ui-store";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";

export function useProjectContext() {
  const projectId = useUiStore((s) => s.activeProjectId);
  const sprintId = useUiStore((s) => s.activeSprintId);
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);
  const setActiveSprintId = useUiStore((s) => s.setActiveSprintId);
  const setProjectContext = useUiStore((s) => s.setProjectContext);

  return {
    projectId,
    sprintId,
    setActiveProjectId,
    setActiveSprintId,
    setProjectContext,
  };
}

/** Redirects to projects list when no active project is selected. */
export function useRequireProjectId(): string | null {
  const router = useRouter();
  const projectId = useUiStore((s) => s.activeProjectId);

  useEffect(() => {
    if (!projectId) {
      router.replace(SCREEN_PATHS.projects);
    }
  }, [projectId, router]);

  return projectId;
}

/** Redirects when project or sprint context is missing. */
export function useRequireSprintContext(): {
  projectId: string | null;
  sprintId: string | null;
} {
  const router = useRouter();
  const projectId = useUiStore((s) => s.activeProjectId);
  const sprintId = useUiStore((s) => s.activeSprintId);

  useEffect(() => {
    if (!projectId) {
      router.replace(SCREEN_PATHS.projects);
      return;
    }
    if (!sprintId) {
      router.replace(SCREEN_PATHS.sprints);
    }
  }, [projectId, sprintId, router]);

  return { projectId, sprintId };
}
