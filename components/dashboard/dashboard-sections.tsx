"use client";

import Link from "next/link";
import { Calendar, Download, FolderKanban, SlidersHorizontal } from "lucide-react";
import { ActiveProjectCard } from "@/components/dashboard/active-project-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActiveProjectSummary, DashboardTask } from "@/lib/api/types";

const dateRangeLabels: Record<string, string> = {
  "7": "Last 7 Days",
  "30": "Last 30 Days",
  "90": "Last 90 Days",
};

export function DashboardHeader({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}) {
  return (
    <header className="relative w-full border-b border-indigo-100/80 bg-white/80 px-6 py-6 backdrop-blur-md lg:px-8 xl:px-10 page-enter">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Analytics</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Comprehensive overview of all active projects
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-sm text-slate-700">
              <SelectValue>{dateRangeLabels[dateRange]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
    </header>
  );
}

export function DashboardStandupBanner({
  blocked,
  needsStandup,
}: {
  blocked: boolean;
  needsStandup: boolean;
}) {
  if (!needsStandup) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Daily standup required</p>
      <p className="mt-0.5 text-amber-800/80">
        {blocked
          ? "Complete the standup modal to unlock the Kanban board."
          : "Submit today's standup when you're ready."}
      </p>
    </div>
  );
}

export function DashboardActiveProjects({
  projects,
}: {
  projects: ActiveProjectSummary[];
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Active Projects</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-slate-600">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Priority
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-slate-600">
            <Calendar className="h-3.5 w-3.5" />
            Due Date
          </Button>
          <Button variant="ghost" size="sm" className="text-indigo-600" asChild>
            <Link href="/projects/">View all</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ActiveProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export function DashboardMyTasks({ tasks }: { tasks: DashboardTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">My Tasks</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Assigned to you across projects, miscellaneous, and routine work
      </p>
      <div className="mt-4 divide-y divide-slate-100">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
              <p className="truncate text-xs text-slate-500">
                {task.projectName ??
                  (task.kind === "routine"
                    ? "Routine task"
                    : task.kind === "miscellaneous"
                      ? "Miscellaneous"
                      : "Project task")}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs capitalize text-slate-600">
              {task.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
