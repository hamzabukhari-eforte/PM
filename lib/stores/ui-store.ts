import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  activeProjectId: string | null;
  activeSprintId: string | null;
  lastBoardUrl: string | null;
  lastBoardLabel: string | null;
  standupReturnUrl: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveSprintId: (id: string | null) => void;
  setProjectContext: (projectId: string, sprintId?: string | null) => void;
  setLastBoard: (url: string | null, label?: string | null) => void;
  setStandupReturnUrl: (url: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeProjectId: null,
      activeSprintId: null,
      lastBoardUrl: null,
      lastBoardLabel: null,
      standupReturnUrl: null,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveProjectId: (id) =>
        set({ activeProjectId: id, ...(id === null ? { activeSprintId: null } : {}) }),
      setActiveSprintId: (id) => set({ activeSprintId: id }),
      setProjectContext: (projectId, sprintId = null) =>
        set({
          activeProjectId: projectId,
          activeSprintId: sprintId ?? null,
        }),
      setLastBoard: (url, label = null) =>
        set({ lastBoardUrl: url, lastBoardLabel: label ?? null }),
      setStandupReturnUrl: (url) => set({ standupReturnUrl: url }),
    }),
    {
      name: "agileflow-ui",
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        activeSprintId: state.activeSprintId,
        sidebarOpen: state.sidebarOpen,
        lastBoardUrl: state.lastBoardUrl,
        lastBoardLabel: state.lastBoardLabel,
      }),
    },
  ),
);
