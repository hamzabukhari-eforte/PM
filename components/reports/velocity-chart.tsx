"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { VelocityPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";

const CHART_HEIGHT = 300;

export function VelocityChart({ data }: { data: VelocityPoint[] }) {
  const ready = useChartReady();
  if (!ready) return <div className="h-[300px] w-full min-w-0" />;
  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="sprintName" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="committed" fill="#94a3b8" name="Committed" />
          <Bar dataKey="completed" fill="#2563eb" name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
