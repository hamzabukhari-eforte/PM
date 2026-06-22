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
import type { AssigneeWorkloadPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";
import { ChartPlaceholder, REPORT_CHART_HEIGHT, chartTooltipStyle } from "./chart-utils";

export function AssigneeWorkloadChart({ data }: { data: AssigneeWorkloadPoint[] }) {
  const ready = useChartReady();
  if (!ready) return <ChartPlaceholder />;

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={REPORT_CHART_HEIGHT} minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend />
          <Bar dataKey="storyPoints" fill="#c7d2fe" name="Total pts" radius={[0, 4, 4, 0]} />
          <Bar dataKey="donePoints" fill="#6366f1" name="Done pts" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
