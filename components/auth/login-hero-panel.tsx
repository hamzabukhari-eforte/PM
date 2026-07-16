"use client";

import { FolderKanban, LayoutDashboard, MessageSquare, Sparkles } from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Live dashboards",
    description: "Track progress, velocity, and team health in one place.",
  },
  {
    icon: FolderKanban,
    title: "Sprint boards",
    description: "Plan work and move tasks across Kanban with your team.",
  },
  {
    icon: MessageSquare,
    title: "Daily standups",
    description: "Capture updates and keep delivery aligned every morning.",
  },
];

export function LoginHeroPanel() {
  return (
    <aside className="relative flex min-h-[42vh] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 px-8 py-10 text-white lg:min-h-screen lg:w-[48%] lg:px-12 lg:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-white/10"
      />

      <div className="login-panel-enter relative">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 shadow-lg shadow-indigo-950/30 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-indigo-100" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">AgileFlow</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-200/80">
              Project workspace
            </p>
          </div>
        </div>

        <h1 className="mt-10 max-w-md text-3xl font-semibold leading-tight tracking-tight lg:mt-14 lg:text-4xl">
          Agile project management for modern delivery teams
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-indigo-100/85 lg:text-[15px]">
          Plan sprints, run standups, and ship with clarity — one workspace for
          boards, reports, and day-to-day execution.
        </p>
      </div>

      <div className="login-features-enter relative mt-10 hidden sm:grid sm:grid-cols-3 sm:gap-3 lg:mt-0 lg:grid-cols-1 lg:gap-3 xl:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            <Icon className="h-4 w-4 text-indigo-100" />
            <p className="mt-2.5 text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-indigo-100/75">{description}</p>
          </div>
        ))}
      </div>

      <p className="relative mt-8 hidden text-xs text-indigo-200/60 lg:block">
        © {new Date().getFullYear()} AgileFlow. All rights reserved.
      </p>
    </aside>
  );
}
