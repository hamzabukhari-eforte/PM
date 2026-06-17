"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusDistributionPoint } from "@/lib/api/types";
import { useChartReady } from "@/lib/hooks/use-chart-ready";

const CHART_HEIGHT = 280;

export function StatusDonutChart({ data }: { data: StatusDistributionPoint[] }) {
  const ready = useChartReady();
  if (!data.length || !ready) {
    return <div className="h-[280px] w-full min-w-0" />;
  }

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
              backgroundColor: "#fff",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
