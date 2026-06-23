"use client";

import { AppHeader } from "@/components/layout/app-header";
import { PageContent } from "@/components/layout/page-content";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useProjectReports } from "@/lib/hooks/use-project-reports";

export function ReportsView() {
  const {
    report,
    loading,
    error,
    sprints,
    activeSprintId,
    setSprintId,
    standupsQuery,
    refetch,
  } = useProjectReports();

  return (
    <>
      <AppHeader
        title={report ? `${report.projectName} — Reports` : "Project reports"}
        description="Health, delivery metrics, team activity, and plan progress at a glance."
      />
      <PageContent className="space-y-8">
        {loading && <LoadingState />}
        {error && <ErrorState onRetry={refetch} />}
        {report && (
          <ReportsDashboard
            report={report}
            sprints={sprints}
            activeSprintId={activeSprintId}
            onSprintChange={setSprintId}
            standupsLoading={standupsQuery.isLoading}
            standups={standupsQuery.data}
          />
        )}
      </PageContent>
    </>
  );
}
