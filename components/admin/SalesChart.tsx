"use client";

import { SalesDayPoint } from "@/types";

export default function SalesChart({
  data,
  revenueLabel,
}: {
  data: SalesDayPoint[];
  revenueLabel: string;
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="overflow-hidden rounded-xl border border-white/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500">
        {revenueLabel}
      </p>
      <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const height = Math.max(10, (point.revenue / maxRevenue) * 100);
          const hasSales = point.revenue > 0;
          return (
            <div
              key={point.date}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  hasSales ? "text-brand-electric" : "text-brand-gray-400"
                }`}
              >
                {hasSales ? `€${Math.round(point.revenue)}` : "—"}
              </span>
              <div className="flex h-32 w-full items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    hasSales
                      ? "bg-gradient-to-t from-brand-navy via-brand-electric to-brand-electric-light group-hover:from-brand-electric-dark group-hover:to-brand-electric group-hover:shadow-glow-electric"
                      : "bg-brand-gray-100"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${point.label}: €${point.revenue.toFixed(2)} (${point.orders} orders)`}
                />
              </div>
              <span className="text-[10px] font-bold uppercase text-brand-gray-400">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
