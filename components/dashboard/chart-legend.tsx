import type { StatusDistributionPoint } from "@/lib/api/types";

export function ChartLegend({ items }: { items: StatusDistributionPoint[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-xs text-slate-500">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>
            {item.name} ({item.value})
          </span>
        </div>
      ))}
    </div>
  );
}
