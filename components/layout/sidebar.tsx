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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/utils/roles";

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

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 border-slate-200 bg-white lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200/80 bg-white transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            A
          </div>
          <span className="text-[15px] font-semibold tracking-tight">AgileFlow</span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href.slice(0, -1));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-primary"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200/80 p-3">
          <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role ? roleLabel(user.role) : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => {
              logout();
              window.location.href = "/login/";
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[1px] lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
