"use client";

import { type ReactNode } from "react";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { cn } from "@/lib/utils";

export function AppHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="relative w-full border-b border-indigo-100/80 bg-white/80 px-6 py-5 backdrop-blur-md lg:px-8 xl:px-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent"
        aria-hidden
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-[15px] text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn("flex flex-wrap items-center gap-2 sm:shrink-0")}>
          {actions}
          <ProjectSwitcher />
        </div>
      </div>
    </header>
  );
}
