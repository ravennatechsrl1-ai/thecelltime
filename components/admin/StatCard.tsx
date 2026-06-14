"use client";

import { ReactNode } from "react";

const tones = {
  navy: "border-l-brand-navy bg-blue-50/60",
  emerald: "border-l-emerald-500 bg-emerald-50/60",
  coral: "border-l-brand-coral bg-orange-50/60",
  violet: "border-l-brand-violet bg-violet-50/60",
  electric: "border-l-brand-electric bg-sky-50/60",
  amber: "border-l-amber-500 bg-amber-50/60",
} as const;

export default function StatCard({
  label,
  value,
  hint,
  tone = "navy",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: keyof typeof tones;
  icon: ReactNode;
}) {
  return (
    <div
      className={`border border-brand-gray-200 border-l-4 ${tones[tone]} p-4 sm:p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-brand-gray-500">{hint}</p>
          )}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-gray-600 shadow-sm">
          {icon}
        </span>
      </div>
    </div>
  );
}
