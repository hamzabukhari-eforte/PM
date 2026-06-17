"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BurndownPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";

const CHART_HEIGHT = 300;

export function BurndownChart({ data }: { data: BurndownPoint[] }) {
  const ready = useChartReady();
  if (!ready) return <div className="h-[300px] w-full min-w-0" />;
  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal" />
          <Line type="monotone" dataKey="actual" stroke="#2563eb" name="Actual" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
