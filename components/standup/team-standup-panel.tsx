"use client";

import { format } from "date-fns";
import type { TeamStandupOverview } from "@/lib/api/types";
import { formatStandupProjectNames } from "@/lib/utils/standup";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export function TeamStandupPanel({
  overview,
  compact = false,
}: {
  overview: TeamStandupOverview;
  compact?: boolean;
}) {
  const submitted = overview.members.filter((m) => m.submitted).length;
  const total = overview.members.length;

  if (total === 0) {
    return (
      <EmptyState
        title="No team members"
        description="Invite members to a project to track standups."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {overview.projectName ?? "All projects"}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")} · {submitted} of {total} submitted
          </p>
        </div>
        <Badge variant={submitted === total ? "success" : "warning"}>
          {submitted === total ? "Complete" : `${total - submitted} pending`}
        </Badge>
      </div>

      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "lg:grid-cols-2")}>
        {overview.members.map((member) => (
          <Card
            key={member.userId}
            className={cn(
              "border-slate-200/80 shadow-none",
              !member.submitted && "border-dashed bg-slate-50/50",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-medium">{member.userName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <Badge variant={member.submitted ? "success" : "warning"}>
                  {member.submitted ? "Submitted" : "Pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              {member.entry ? (
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Yesterday
                    </dt>
                    <dd className="mt-0.5 text-foreground/90">{member.entry.yesterday}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Today
                    </dt>
                    <dd className="mt-0.5 text-foreground/90">{member.entry.today}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Blockers
                    </dt>
                    <dd className="mt-0.5 text-foreground/90">{member.entry.blockers}</dd>
                  </div>
                  {formatStandupProjectNames(member.entry) !== "—" && (
                    <p className="pt-1 text-xs text-muted-foreground">
                      {formatStandupProjectNames(member.entry)}
                      {member.entry.submittedAt && (
                        <> · {format(new Date(member.entry.submittedAt), "h:mm a")}</>
                      )}
                    </p>
                  )}
                </dl>
              ) : (
                <p className="text-muted-foreground">No standup submitted yet today.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
