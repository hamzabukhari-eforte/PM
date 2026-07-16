"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { BASE_PATH } from "@/lib/base-path";

const useMsw = process.env.NEXT_PUBLIC_USE_MSW === "true";

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!useMsw);

  useEffect(() => {
    if (!useMsw) return;

    async function init() {
      try {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: { url: `${BASE_PATH}/mockServiceWorker.js` },
          quiet: true,
        });
      } catch (error) {
        console.error("MSW failed to start (demo API unavailable)", error);
      } finally {
        setReady(true);
      }
    }

    void init();
  }, []);

  if (!ready) {
    return <LoadingState label="Starting demo API…" />;
  }

  return <>{children}</>;
}
