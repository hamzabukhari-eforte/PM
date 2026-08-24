"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuTreeNode } from "@/lib/api/types";
import { PROJECT_SCOPED_PATHS, SCREEN_PATHS } from "@/lib/navigation/screen-paths";

function pathActive(pathname: string, path: string | null): boolean {
  if (!path) return false;
  const base = path.endsWith("/") ? path.slice(0, -1) : path;
  return pathname === base || pathname === path || pathname.startsWith(`${base}/`);
}

function subtreeActive(pathname: string, node: MenuTreeNode): boolean {
  if (pathActive(pathname, node.path)) return true;
  return node.children.some((c) => subtreeActive(pathname, c));
}

function NavLink({
  item,
  icon: Icon,
  nested,
  hasProject,
}: {
  item: MenuTreeNode;
  icon: LucideIcon;
  nested?: boolean;
  hasProject: boolean;
}) {
  const pathname = usePathname();
  if (!item.path) return null;

  const needsProject = PROJECT_SCOPED_PATHS.has(item.path) || item.requiresProject;
  const href = needsProject && !hasProject ? SCREEN_PATHS.projects : item.path;
  const active = pathActive(pathname, item.path);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium transition-all duration-200 cursor-pointer",
        nested && "py-2 pl-3",
        active
          ? "nav-item-active text-white"
          : "text-indigo-200/90 hover:bg-white/8 hover:text-white",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-indigo-200")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavGroup({
  item,
  icon: Icon,
  resolveIcon,
  hasProject,
  defaultOpen,
}: {
  item: MenuTreeNode;
  icon: LucideIcon;
  resolveIcon: (node: MenuTreeNode) => LucideIcon;
  hasProject: boolean;
  defaultOpen: boolean;
}) {
  const pathname = usePathname();
  const activeInTree = subtreeActive(pathname, item);
  const [open, setOpen] = useState(defaultOpen || activeInTree);

  useEffect(() => {
    if (activeInTree) setOpen(true);
  }, [activeInTree]);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200 cursor-pointer",
          activeInTree
            ? "text-white"
            : "text-indigo-200/90 hover:bg-white/8 hover:text-white",
        )}
        aria-expanded={open}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-indigo-300/80 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-2 space-y-0.5 border-l border-white/10 py-0.5 pl-2">
            {item.children.map((child) =>
              child.children.length > 0 ? (
                <NavGroup
                  key={child.id}
                  item={child}
                  icon={resolveIcon(child)}
                  resolveIcon={resolveIcon}
                  hasProject={hasProject}
                  defaultOpen={subtreeActive(pathname, child)}
                />
              ) : (
                <NavLink
                  key={child.id}
                  item={child}
                  icon={resolveIcon(child)}
                  nested
                  hasProject={hasProject}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarNav({
  nodes,
  resolveIcon,
  hasProject,
}: {
  nodes: MenuTreeNode[];
  resolveIcon: (node: MenuTreeNode) => LucideIcon;
  hasProject: boolean;
}) {
  const pathname = usePathname();
  const items = useMemo(() => nodes, [nodes]);

  return (
    <div className="space-y-1">
      {items.map((node) =>
        node.children.length > 0 ? (
          <NavGroup
            key={node.id}
            item={node}
            icon={resolveIcon(node)}
            resolveIcon={resolveIcon}
            hasProject={hasProject}
            defaultOpen={subtreeActive(pathname, node)}
          />
        ) : (
          <NavLink
            key={node.id}
            item={node}
            icon={resolveIcon(node)}
            hasProject={hasProject}
          />
        ),
      )}
    </div>
  );
}
