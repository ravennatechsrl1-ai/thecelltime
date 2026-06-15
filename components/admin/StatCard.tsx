"use client";

import { ReactNode } from "react";

const tones = {
  navy: {
    card: "bg-gradient-to-br from-[#0a1628] via-[#132238] to-[#1a3055]",
    icon: "bg-brand-electric/20 text-brand-electric-light",
    label: "text-white/55",
    value: "text-white",
    hint: "text-white/45",
    ring: "ring-brand-electric/20",
  },
  electric: {
    card: "bg-gradient-to-br from-brand-electric to-brand-electric-dark",
    icon: "bg-white/20 text-white",
    label: "text-white/70",
    value: "text-white",
    hint: "text-white/60",
    ring: "ring-white/20",
  },
  emerald: {
    card: "bg-gradient-to-br from-emerald-600 to-teal-700",
    icon: "bg-white/20 text-white",
    label: "text-white/70",
    value: "text-white",
    hint: "text-white/60",
    ring: "ring-white/20",
  },
  violet: {
    card: "bg-gradient-to-br from-violet-600 to-indigo-700",
    icon: "bg-white/20 text-white",
    label: "text-white/70",
    value: "text-white",
    hint: "text-white/60",
    ring: "ring-white/20",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-500 to-orange-600",
    icon: "bg-white/20 text-white",
    label: "text-white/70",
    value: "text-white",
    hint: "text-white/60",
    ring: "ring-white/20",
  },
  coral: {
    card: "bg-gradient-to-br from-rose-500 to-pink-600",
    icon: "bg-white/20 text-white",
    label: "text-white/70",
    value: "text-white",
    hint: "text-white/60",
    ring: "ring-white/20",
  },
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
  const style = tones[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl p-4 ring-1 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${style.card} ${style.ring}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-transform duration-300 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${style.label}`}>
            {label}
          </p>
          <p className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl ${style.value}`}>
            {value}
          </p>
          {hint && (
            <p className={`mt-1 text-xs ${style.hint}`}>{hint}</p>
          )}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 ${style.icon}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
