"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatusDistributionPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";
import { ChartPlaceholder, REPORT_CHART_HEIGHT, chartTooltipStyle } from "./chart-utils";

export function StoryPointsStatusChart({ data }: { data: StatusDistributionPoint[] }) {
  const ready = useChartReady();
  if (!ready) return <ChartPlaceholder />;

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={REPORT_CHART_HEIGHT} minWidth={0}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend />
          <Bar dataKey="value" name="Story points" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
