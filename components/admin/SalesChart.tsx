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
    <div className="border border-brand-gray-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500">
        {revenueLabel}
      </p>
      <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const height = Math.max(8, (point.revenue / maxRevenue) * 100);
          return (
            <div
              key={point.date}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] font-semibold text-brand-gray-600">
                {point.revenue > 0 ? `€${Math.round(point.revenue)}` : "—"}
              </span>
              <div
                className="w-full rounded-t bg-gradient-to-t from-brand-navy to-brand-electric transition-all"
                style={{ height: `${height}%` }}
                title={`${point.label}: €${point.revenue.toFixed(2)}`}
              />
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
