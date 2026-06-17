import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  activeProjectId: string | null;
  standupReturnUrl: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveProjectId: (id: string | null) => void;
  setStandupReturnUrl: (url: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeProjectId: null,
      standupReturnUrl: null,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      setStandupReturnUrl: (url) => set({ standupReturnUrl: url }),
    }),
    {
      name: "agileflow-ui",
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);
