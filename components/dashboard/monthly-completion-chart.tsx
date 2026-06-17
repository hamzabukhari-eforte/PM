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
import type { MonthlyCompletionPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";

const CHART_HEIGHT = 280;

export function MonthlyCompletionChart({ data }: { data: MonthlyCompletionPoint[] }) {
  const ready = useChartReady();
  if (!data.length || !ready) {
    return <div className="h-[280px] w-full min-w-0" />;
  }

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
              backgroundColor: "#fff",
            }}
          />
          <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
