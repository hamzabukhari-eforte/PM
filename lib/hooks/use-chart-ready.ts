"use client";

import { useEffect, useState } from "react";

export function useChartReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
