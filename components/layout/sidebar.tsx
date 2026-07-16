"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  CheckSquare,
  LogOut,
  Menu,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/utils/roles";
import { useProjectBoard } from "@/lib/hooks/use-project-board";
import { BASE_PATH } from "@/lib/base-path";

const navItems = [
  { href: "/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects/", label: "Projects", icon: FolderKanban },
  { href: "/tasks/", label: "Tasks", icon: CheckSquare },
  { href: "/standup/", label: "Standup", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const activeProjectId = useUiStore((s) => s.activeProjectId);
  const lastBoardUrl = useUiStore((s) => s.lastBoardUrl);
  const lastBoardLabel = useUiStore((s) => s.lastBoardLabel);

  const { boardUrl: activeBoardUrl } = useProjectBoard(activeProjectId);
  const continueBoardUrl = lastBoardUrl ?? activeBoardUrl;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 border-white/20 bg-indigo-950/90 text-white backdrop-blur lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <aside
        className={cn(
          "sidebar-gradient fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 text-[var(--sidebar-foreground)] shadow-xl transition-transform duration-300 ease-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-900/40">
            A
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">AgileFlow</span>
            <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-300/80">
              Project workspace
            </p>
          </div>
        </div>

        {continueBoardUrl && (
          <div className="mx-3 mb-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-200/90">
              <Sparkles className="h-3 w-3" />
              Quick access
            </p>
            <Link
              href={continueBoardUrl}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span className="truncate">{lastBoardLabel ?? "Kanban board"}</span>
            </Link>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 pt-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href.slice(0, -1));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "nav-item-active text-white"
                    : "text-indigo-200/90 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-indigo-200")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 rounded-xl bg-white/8 px-3 py-3 backdrop-blur-sm">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-indigo-200/70">
              {user?.role ? roleLabel(user.role) : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-indigo-200/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              window.location.href = `${BASE_PATH}/login/`;
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
