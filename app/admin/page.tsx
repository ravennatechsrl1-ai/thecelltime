"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import AdminShell, { AdminView } from "@/components/admin/AdminShell";
import CustomersPanel from "@/components/admin/CustomersPanel";
import DashboardOverview from "@/components/admin/DashboardOverview";
import OrdersPanel from "@/components/admin/OrdersPanel";
import ProductsPanel from "@/components/admin/ProductsPanel";
import RepairsPanel from "@/components/admin/RepairsPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { AdminDashboardStats } from "@/types";

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const navItems = useMemo(
    () => [
      {
        id: "dashboard" as const,
        label: t.admin.navDashboard,
        icon: (
          <NavIcon>
            <rect x="3" y="3" width="6" height="6" rx="0.5" />
            <rect x="11" y="3" width="6" height="6" rx="0.5" />
            <rect x="3" y="11" width="6" height="6" rx="0.5" />
            <rect x="11" y="11" width="6" height="6" rx="0.5" />
          </NavIcon>
        ),
      },
      {
        id: "products" as const,
        label: t.admin.navProducts,
        icon: (
          <NavIcon>
            <path d="M4 7l6-3 6 3v6l-6 3-6-3V7z" />
          </NavIcon>
        ),
      },
      {
        id: "orders" as const,
        label: t.admin.navOrders,
        icon: (
          <NavIcon>
            <path d="M3 5h14M3 10h14M3 15h10" strokeLinecap="round" />
          </NavIcon>
        ),
      },
      {
        id: "customers" as const,
        label: t.admin.navCustomers,
        icon: (
          <NavIcon>
            <circle cx="10" cy="7" r="3" />
            <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
          </NavIcon>
        ),
      },
      {
        id: "repairs" as const,
        label: t.admin.navRepairs,
        icon: (
          <NavIcon>
            <path d="M14 4l2 2-8 8H6v-2l8-8z" strokeLinejoin="round" />
          </NavIcon>
        ),
      },
    ],
    [t]
  );

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      const data: { stats?: AdminDashboardStats } = await response.json();
      setStats(data.stats ?? null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("thecelltime-admin") === "1") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadStats();
    }
  }, [authenticated, loadStats]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data: { authenticated: boolean; error?: string } =
        await response.json();

      if (!response.ok || !data.authenticated) {
        throw new Error(data.error ?? t.admin.invalidPassword);
      }

      setAuthenticated(true);
      sessionStorage.setItem("thecelltime-admin", "1");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : t.admin.authError);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("thecelltime-admin");
    setAuthenticated(false);
    setPassword("");
    setActiveView("dashboard");
  }

  if (!authenticated) {
    return (
      <div className="container-app flex min-h-[60vh] items-center justify-center py-10">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm border border-brand-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <p className="section-title mb-2">{t.admin.restricted}</p>
          <h1 className="heading-lg text-xl sm:text-2xl">{t.admin.title}</h1>
          <p className="mt-2 text-sm text-brand-gray-600">{t.admin.loginDesc}</p>

          <div className="mt-6">
            <label
              htmlFor="admin-password"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
            >
              {t.admin.password}
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>

          {authError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="btn-primary mt-6 disabled:opacity-50"
          >
            {authLoading ? t.admin.verifying : t.admin.login}
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminShell
      activeView={activeView}
      onViewChange={setActiveView}
      navItems={navItems}
      title={t.admin.hubTitle}
      subtitle={t.admin.hubBadge}
      onLogout={handleLogout}
      logoutLabel={t.admin.logout}
    >
      {activeView === "dashboard" && (
        <DashboardOverview stats={stats} loading={statsLoading} />
      )}
      {activeView === "products" && <ProductsPanel />}
      {activeView === "orders" && <OrdersPanel />}
      {activeView === "customers" && <CustomersPanel />}
      {activeView === "repairs" && <RepairsPanel />}
    </AdminShell>
  );
}
