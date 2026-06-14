"use client";

import { ReactNode } from "react";

export type AdminView =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "repairs";

interface NavItem {
  id: AdminView;
  label: string;
  icon: ReactNode;
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
  navItems: NavItem[];
  title: string;
  subtitle: string;
  onLogout: () => void;
  logoutLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f4f5f7]">
      <div className="border-b border-brand-gray-200 bg-white">
        <div className="container-app flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray-400">
              {subtitle}
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-brand-navy sm:text-3xl">
              {title}
            </h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="self-start border border-brand-gray-300 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-gray-700 transition-colors hover:border-brand-black hover:text-brand-black"
          >
            {logoutLabel}
          </button>
        </div>
      </div>

      <div className="container-app py-5 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <aside className="lg:w-56 lg:shrink-0">
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={`flex shrink-0 items-center gap-2.5 border px-4 py-3 text-left text-xs font-bold uppercase tracking-wide transition-colors lg:w-full ${
                    activeView === item.id
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-gray-400"
                  }`}
                >
                  <span className="opacity-90">{item.icon}</span>
                  {item.label}
                </button>
              ))}
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
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border border-brand-gray-200 bg-white ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-brand-gray-100 px-4 py-3 sm:px-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-gray-600">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
