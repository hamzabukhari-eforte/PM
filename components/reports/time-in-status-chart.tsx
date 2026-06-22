"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeInStatusPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";
import { ChartPlaceholder, REPORT_CHART_HEIGHT, chartTooltipStyle } from "./chart-utils";

export function TimeInStatusChart({ data }: { data: TimeInStatusPoint[] }) {
  const ready = useChartReady();
  const filtered = data.filter((d) => d.avgHours > 0);
  if (!ready) return <ChartPlaceholder />;

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={REPORT_CHART_HEIGHT} minWidth={0}>
        <BarChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} unit="h" />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v} hrs`, "Avg time"]} />
          <Bar dataKey="avgHours" fill="#8b5cf6" name="Avg hours" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
