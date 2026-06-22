"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project } from "@/lib/api/types";
import { useUiStore } from "@/lib/stores/ui-store";
import { useProjectBoard } from "@/lib/hooks/use-project-board";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BoardQuickLink } from "@/components/layout/board-quick-link";

export function ProjectSwitcher() {
  const activeProjectId = useUiStore((s) => s.activeProjectId);
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient<Project[]>(endpoints.projects.list),
  });

  const { boardUrl } = useProjectBoard(activeProjectId);

  if (projects.length === 0) return null;

  const value = activeProjectId ?? projects[0]?.id ?? "";

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(id) => setActiveProjectId(id)}>
        <SelectTrigger className="h-10 w-[min(100vw-8rem,220px)] border-slate-200/80 bg-white text-sm shadow-sm">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {activeProjectId && boardUrl && (
        <BoardQuickLink
          projectId={activeProjectId}
          label="Board"
          tone="primary"
          size="sm"
          showArrow={false}
          className="hidden sm:inline-flex"
        />
      )}
    </div>
  );
}
