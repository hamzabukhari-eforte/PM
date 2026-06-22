"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { StandupProvider } from "@/components/standup/standup-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <StandupProvider>
        <div className="app-shell-bg min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 transition-[padding] duration-300 lg:pl-64">{children}</main>
        </div>
      </StandupProvider>
    </AuthGuard>
  );
}
