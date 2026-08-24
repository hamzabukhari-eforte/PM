"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  CheckSquare,
  LogOut,
  Menu,
  LayoutGrid,
  Sparkles,
  ClipboardList,
  Rocket,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/utils/roles";
import { useProjectBoard } from "@/lib/hooks/use-project-board";
import { BASE_PATH } from "@/lib/base-path";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { MenuItem, MenuTreeNode } from "@/lib/api/types";
import { SCREEN_PATHS } from "@/lib/navigation/screen-paths";
import { buildMenuTree, filterMenuTree } from "@/lib/navigation/menu-tree";
import { SidebarNav } from "@/components/layout/sidebar-nav";

const iconByKey: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  tasks: CheckSquare,
  standup: MessageSquare,
  project: FolderKanban,
  plan: ClipboardList,
  sprints: Rocket,
  board: LayoutGrid,
  team: Users,
  reports: BarChart3,
  settings: Settings,
};

function menuIcon(item: MenuTreeNode): LucideIcon {
  if (item.icon && iconByKey[item.icon]) return iconByKey[item.icon];
  return LayoutGrid;
}

export function Sidebar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const activeProjectId = useUiStore((s) => s.activeProjectId);
  const lastBoardUrl = useUiStore((s) => s.lastBoardUrl);
  const lastBoardLabel = useUiStore((s) => s.lastBoardLabel);
  const setProjectContext = useUiStore((s) => s.setProjectContext);

  const { boardUrl: activeBoardUrl, preferredSprintId } = useProjectBoard(activeProjectId);
  const continueBoardUrl = lastBoardUrl ?? activeBoardUrl;
  const hasProject = !!activeProjectId;

  const menusQuery = useQuery({
    queryKey: ["menus"],
    queryFn: () => apiClient<MenuItem[]>(endpoints.menus.list),
  });

  const navTree = useMemo(() => {
    const tree = buildMenuTree(menusQuery.data ?? []);
    return filterMenuTree(tree, hasProject);
  }, [menusQuery.data, hasProject]);

  function openQuickBoard() {
    if (!activeProjectId) {
      router.push(SCREEN_PATHS.projects);
      return;
    }
    setProjectContext(activeProjectId, preferredSprintId);
    router.push(continueBoardUrl ?? SCREEN_PATHS.board);
  }

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

        {continueBoardUrl && activeProjectId && (
          <div className="mx-3 mb-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-200/90">
              <Sparkles className="h-3 w-3" />
              Quick access
            </p>
            <button
              type="button"
              onClick={openQuickBoard}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span className="truncate">{lastBoardLabel ?? "Kanban board"}</span>
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-1 pb-3">
          {menusQuery.isLoading && (
            <p className="px-3 py-2 text-xs text-indigo-200/70">Loading menu…</p>
          )}
          {!menusQuery.isLoading && (
            <SidebarNav nodes={navTree} resolveIcon={menuIcon} hasProject={hasProject} />
          )}
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
              window.location.href = `${BASE_PATH}${SCREEN_PATHS.login}`;
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
