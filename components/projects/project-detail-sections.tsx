import Link from "next/link";
import type { Project, ProjectLookups } from "@/lib/api/types";
import { BoardQuickLink } from "@/components/layout/board-quick-link";
import { Badge } from "@/components/ui/badge";
import { lookupLabel } from "@/lib/utils/project-lookups";

export function ProjectDetailHero({
  project,
  projectId,
  lookups,
}: {
  project: Project;
  projectId: string;
  lookups?: ProjectLookups;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-500/20 lg:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {project.projectCode && (
              <Badge className="border-white/20 bg-white/15 font-mono text-white hover:bg-white/20">
                {project.projectCode}
              </Badge>
            )}
            {project.isDraft && (
              <Badge className="border-white/20 bg-amber-400/20 text-amber-50">Draft</Badge>
            )}
            {project.projectAction === "hold" && (
              <Badge className="border-white/20 bg-white/10 text-indigo-100">On hold</Badge>
            )}
            {lookupLabel(lookups?.priorities, project.priorityId) && (
              <Badge className="border-white/20 bg-white/10 text-indigo-100">
                {lookupLabel(lookups?.priorities, project.priorityId)}
              </Badge>
            )}
          </div>
          <p className="max-w-2xl text-[15px] leading-relaxed text-indigo-100/90">
            {project.description || "No description yet."}
          </p>
          {(project.startDate || project.endDate) && (
            <p className="text-sm text-indigo-200/80">
              Timeline: {project.startDate ?? "—"} → {project.endDate ?? "—"}
            </p>
          )}
        </div>
        <BoardQuickLink
          projectId={projectId}
          label="Open Kanban board"
          tone="hero"
          size="lg"
          className="shrink-0"
        />
      </div>
    </section>
  );
}

export function ProjectQuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card-interactive group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export function ProjectDetailMetaSection({
  project,
  lookups,
}: {
  project: Project;
  lookups?: ProjectLookups;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Project details
      </h2>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Meta label="Type" value={lookupLabel(lookups?.projectTypes, project.projectTypeId)} />
        <Meta label="Category" value={lookupLabel(lookups?.categories, project.categoryId)} />
        <Meta label="Status" value={lookupLabel(lookups?.projectStatuses, project.projectStatusId)} />
        <Meta label="Requirements received" value={project.brdReceivingDate} />
        <Meta label="Members" value={String(project.memberCount)} />
        <Meta label="Active sprints" value={String(project.activeSprintCount)} />
      </dl>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}
