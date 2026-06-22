"use client";

import Link from "next/link";
import type { Project } from "@/lib/api/types";
import { BoardQuickLinkOutline } from "@/components/layout/board-quick-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  onArchive,
}: {
  project: Project;
  onArchive?: () => void;
}) {
  return (
    <Card className={cn("card-interactive overflow-hidden border-slate-200/80")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/projects/${project.id}/`} className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-snug transition-colors hover:text-primary">
              {project.name}
            </CardTitle>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              {project.activeSprintCount} active
            </Badge>
            {onArchive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={onArchive}
              >
                Archive
              </Button>
            )}
          </div>
        </div>
        <Link href={`/projects/${project.id}/`}>
          <CardDescription className="line-clamp-2 hover:text-foreground/80">
            {project.description}
          </CardDescription>
        </Link>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 pt-0">
        <p className="text-xs text-muted-foreground">{project.memberCount} members</p>
        <div className="flex gap-2">
          <BoardQuickLinkOutline projectId={project.id} />
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/projects/${project.id}/`}>Overview</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
