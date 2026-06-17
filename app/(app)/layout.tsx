"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { StandupProvider } from "@/components/standup/standup-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <StandupProvider>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <main className="lg:pl-60">{children}</main>
        </div>
      </StandupProvider>
    </AuthGuard>
  );
}
