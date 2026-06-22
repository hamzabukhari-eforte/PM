"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CumulativeFlowPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";
import { ChartPlaceholder, REPORT_CHART_HEIGHT, chartTooltipStyle } from "./chart-utils";

export function CumulativeFlowChart({ data }: { data: CumulativeFlowPoint[] }) {
  const ready = useChartReady();
  if (!ready) return <ChartPlaceholder />;

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={REPORT_CHART_HEIGHT} minWidth={0}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend />
          <Area
            type="monotone"
            dataKey="done"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.7}
            name="Done"
          />
          <Area
            type="monotone"
            dataKey="review"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.7}
            name="Review"
          />
          <Area
            type="monotone"
            dataKey="inProgress"
            stackId="1"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.7}
            name="In progress"
          />
          <Area
            type="monotone"
            dataKey="todo"
            stackId="1"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.7}
            name="To do"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
