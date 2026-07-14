"use client";

import Link from "next/link";
import type { Project } from "@/lib/api/types";
import { BoardQuickLinkOutline } from "@/components/layout/board-quick-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { projectHref } from "@/lib/utils/static-routes";

export function ProjectTable({
  projects,
  onArchive,
}: {
  projects: Project[];
  onArchive?: (id: string) => void;
}) {
  return (
    <div className="scrollbar-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-[14px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3 w-28">Members</th>
            <th className="px-4 py-3 w-32">Active sprints</th>
            <th className="px-4 py-3 w-48">Timeline</th>
            <th className="px-4 py-3 w-44 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {projects.map((project) => {
            const href = projectHref(project.id);
            return (
              <tr key={project.id} className="border-b border-slate-100 hover:bg-indigo-50/30">
                <td className="px-4 py-3 align-middle">
                  <Link
                    href={href}
                    className="font-medium text-slate-900 hover:text-indigo-700"
                  >
                    {project.name}
                  </Link>
                  {project.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{project.description}</p>
                  )}
                  {project.isDraft && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      Draft
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 align-middle whitespace-nowrap">{project.memberCount}</td>
                <td className="px-4 py-3 align-middle">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                    {project.activeSprintCount}
                  </Badge>
                </td>
                <td className="px-4 py-3 align-middle whitespace-nowrap text-sm text-slate-600">
                  {project.startDate ?? "—"} → {project.endDate ?? "—"}
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <BoardQuickLinkOutline projectId={project.id} />
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={href}>Overview</Link>
                    </Button>
                    {onArchive && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onArchive(project.id)}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
