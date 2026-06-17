"use client";

import Link from "next/link";
import type { Project } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({
  project,
  onArchive,
}: {
  project: Project;
  onArchive?: () => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <Link href={`/projects/${project.id}/`} className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-snug hover:text-primary">
              {project.name}
            </CardTitle>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="secondary">{project.activeSprintCount} active</Badge>
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
      <CardContent>
        <Link href={`/projects/${project.id}/`}>
          <p className="text-xs text-muted-foreground">{project.memberCount} members</p>
        </Link>
      </CardContent>
    </Card>
  );
}
