"use client";

import { ReactNode } from "react";
import SiteLogo from "@/components/SiteLogo";

export type AdminView =
  | "dashboard"
  | "products"
  | "catalog"
  | "promotions"
  | "orders"
  | "customers"
  | "repairs"
  | "settings";

export interface AdminNavItem {
  id: AdminView;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export default function AdminShell({
  activeView,
  onViewChange,
  navItems,
  title,
  subtitle,
  onLogout,
  logoutLabel,
  children,
}: {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  navItems: AdminNavItem[];
  title: string;
  subtitle: string;
  onLogout: () => void;
  logoutLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-brand-gray-50 via-[#eef3ff] to-brand-gray-100">
      <div className="border-b border-brand-navy/20 bg-gradient-to-r from-brand-navy via-[#132238] to-brand-navy-light">
        <div className="container-app flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex items-center gap-4">
            <SiteLogo className="hidden h-9 w-auto sm:block" linked={false} />
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-electric-light">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {subtitle}
              </p>
              <h1 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                {title}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="self-start border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-200 hover:border-brand-electric-light hover:bg-brand-electric/20"
          >
            {logoutLabel}
          </button>
        </div>
      </div>

      <div className="container-app py-5 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <aside className="lg:w-60 lg:shrink-0">
            <nav className="flex gap-2 overflow-x-auto rounded-xl border border-white/60 bg-white/80 p-2 shadow-card backdrop-blur-sm lg:flex-col lg:overflow-visible">
              {navItems.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onViewChange(item.id)}
                    className={`group flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-3 text-left text-xs font-bold uppercase tracking-wide transition-all duration-200 lg:w-full ${
                      active
                        ? "bg-gradient-to-r from-brand-electric to-brand-electric-dark text-white shadow-glow-electric"
                        : "text-brand-gray-600 hover:bg-brand-electric/5 hover:text-brand-electric"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-brand-gray-100 text-brand-gray-600 group-hover:bg-brand-electric/10 group-hover:text-brand-electric"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums ${
                          active
                            ? "bg-white/25 text-white"
                            : "bg-brand-electric/10 text-brand-electric"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
  variant = "default",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark";
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border shadow-card transition-shadow duration-200 hover:shadow-card-hover ${
        variant === "dark"
          ? "border-brand-navy/30 bg-gradient-to-br from-brand-navy to-[#132238] text-white"
          : "border-white/80 bg-white/90 backdrop-blur-sm"
      } ${className}`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 ${
          variant === "dark"
            ? "border-white/10"
            : "border-brand-gray-100"
        }`}
      >
        <h2
          className={`text-xs font-bold uppercase tracking-widest ${
            variant === "dark" ? "text-brand-silver" : "text-brand-gray-500"
          }`}
        >
          {title}
        </h2>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
