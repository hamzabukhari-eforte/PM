import type { CSSProperties } from "react";

export const REPORT_CHART_HEIGHT = 280;

export const chartTooltipStyle: CSSProperties = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "13px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
};

export function ChartPlaceholder({ height = REPORT_CHART_HEIGHT }: { height?: number }) {
  return <div className="w-full min-w-0" style={{ height }} />;
}
