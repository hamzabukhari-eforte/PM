"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StandupParticipationPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";
import { ChartPlaceholder, REPORT_CHART_HEIGHT, chartTooltipStyle } from "./chart-utils";

export function StandupParticipationChart({ data }: { data: StandupParticipationPoint[] }) {
  const ready = useChartReady();
  if (!ready) return <ChartPlaceholder />;

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={REPORT_CHART_HEIGHT} minWidth={0}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend />
          <Bar dataKey="expected" fill="#e2e8f0" name="Expected" radius={[4, 4, 0, 0]} />
          <Bar dataKey="submitted" fill="#6366f1" name="Submitted" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
