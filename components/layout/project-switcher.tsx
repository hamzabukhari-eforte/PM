"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Project } from "@/lib/api/types";
import { useUiStore } from "@/lib/stores/ui-store";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const router = useRouter();
  const activeProjectId = useUiStore((s) => s.activeProjectId);
  const setActiveProjectId = useUiStore((s) => s.setActiveProjectId);
  const setActiveSprintId = useUiStore((s) => s.setActiveSprintId);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiClient<Project[]>(endpoints.projects.list),
  });

  const active = projects.find((p) => p.id === activeProjectId) ?? null;

  if (!isLoading && projects.length === 0) return null;

  function onSelect(id: string) {
    setActiveProjectId(id);
    setActiveSprintId(null);
    router.push(SCREEN_PATHS.project);
  }

  return (
    <Select
      value={activeProjectId ?? undefined}
      onValueChange={onSelect}
      disabled={isLoading || projects.length === 0}
    >
      <SelectTrigger
        aria-label="Switch active project"
        className={cn(
          "h-8 w-[min(100vw-8rem,200px)] gap-1.5 border-slate-200 bg-slate-50/80 px-2 py-0 text-sm font-medium shadow-none",
          "hover:bg-slate-100/80 focus:ring-1 focus:ring-indigo-300",
          "[&>span]:min-w-0 [&>span]:truncate",
          !active && "border-amber-300 bg-amber-50 text-amber-950",
        )}
        title={
          active
            ? "Switching project updates plan, board, and sprints"
            : "Select which project you are working on"
        }
      >
        <FolderKanban
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            active ? "text-indigo-600" : "text-amber-600",
          )}
        />
        <SelectValue
          placeholder={isLoading ? "Loading…" : "Select project"}
        />
      </SelectTrigger>
      <SelectContent align="end">
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
