"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";

const useMsw = process.env.NEXT_PUBLIC_USE_MSW === "true";

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!useMsw);

  useEffect(() => {
    if (!useMsw) return;

    async function init() {
      const { worker } = await import("@/mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
        quiet: true,
      });
      setReady(true);
    }

    void init();
  }, []);

  if (!ready) {
    return <LoadingState label="Starting demo API…" />;
  }

  return <>{children}</>;
}
