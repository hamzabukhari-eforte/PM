"use client";

import Link from "next/link";
import type { Sprint } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusVariant: Record<Sprint["status"], "success" | "default" | "secondary"> = {
  active: "success",
  planned: "default",
  closed: "secondary",
};

export function SprintList({
  sprints,
  projectId,
  canManage,
  onClose,
}: {
  sprints: Sprint[];
  projectId: string;
  canManage: boolean;
  onClose: (sprintId: string) => void;
}) {
  if (sprints.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sprints.map((sprint) => (
        <Card key={sprint.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                <Link
                  href={`/projects/${projectId}/sprints/${sprint.id}/`}
                  className="hover:underline"
                >
                  {sprint.name}
                </Link>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{sprint.goal}</p>
            </div>
            <Badge variant={statusVariant[sprint.status]}>{sprint.status}</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {sprint.startDate} → {sprint.endDate}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${projectId}/sprints/${sprint.id}/board/`}>
                  Board
                </Link>
              </Button>
              {canManage && sprint.status === "active" && (
                <Button variant="ghost" size="sm" onClick={() => onClose(sprint.id)}>
                  Close
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
