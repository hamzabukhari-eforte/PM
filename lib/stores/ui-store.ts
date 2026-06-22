import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  activeProjectId: string | null;
  lastBoardUrl: string | null;
  lastBoardLabel: string | null;
  standupReturnUrl: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveProjectId: (id: string | null) => void;
  setLastBoard: (url: string | null, label?: string | null) => void;
  setStandupReturnUrl: (url: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeProjectId: null,
      lastBoardUrl: null,
      lastBoardLabel: null,
      standupReturnUrl: null,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      setLastBoard: (url, label = null) =>
        set({ lastBoardUrl: url, lastBoardLabel: label ?? null }),
      setStandupReturnUrl: (url) => set({ standupReturnUrl: url }),
    }),
    {
      name: "agileflow-ui",
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        sidebarOpen: state.sidebarOpen,
        lastBoardUrl: state.lastBoardUrl,
        lastBoardLabel: state.lastBoardLabel,
      }),
    },
  ),
);
