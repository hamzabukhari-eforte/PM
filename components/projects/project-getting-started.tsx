"use client";

import Link from "next/link";
import { CheckCircle2, Circle, LayoutGrid, ListTodo, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectHref } from "@/lib/utils/static-routes";

export function ProjectGettingStarted({
  projectId,
  planTaskCount,
  sprintCount,
  hasActiveSprint,
}: {
  projectId: string;
  planTaskCount: number;
  sprintCount: number;
  hasActiveSprint: boolean;
}) {
  const steps = [
    {
      id: "plan",
      done: planTaskCount > 0,
      title: "Build your plan",
      description: "Add tasks and milestones to the work breakdown schedule.",
      href: projectHref(projectId, "plan/"),
      action: "Open plan",
      icon: ListTodo,
    },
    {
      id: "sprint",
      done: sprintCount > 0,
      title: "Create a sprint",
      description: "Time-box work so the team knows what to focus on.",
      href: projectHref(projectId, "sprints/"),
      action: "View sprints",
      icon: Rocket,
    },
    {
      id: "board",
      done: hasActiveSprint,
      title: "Open the Kanban board",
      description: "Move tasks through To do → Done with your team.",
      href: projectHref(projectId, "sprints/"),
      action: "Go to board",
      icon: LayoutGrid,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Getting started</h2>
          <p className="mt-0.5 text-sm text-slate-600">
            {completed} of {steps.length} steps complete — follow these in order.
          </p>
        </div>
      </div>
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between",
                step.done ? "border-emerald-100" : "border-slate-200",
              )}
            >
              <div className="flex items-start gap-3">
                {step.done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">{step.description}</p>
                </div>
                <Icon className="hidden h-4 w-4 shrink-0 text-indigo-400 sm:ml-auto sm:block" />
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 sm:ml-4"
                >
                  {step.action}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
