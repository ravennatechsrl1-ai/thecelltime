"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import {
  IconBrands,
  IconCustomers,
  IconDashboard,
  IconOrders,
  IconProducts,
  IconPromotion,
  IconRepair,
} from "@/components/admin/AdminStatIcons";
import AdminShell, { AdminView } from "@/components/admin/AdminShell";
import CatalogProductsPanel from "@/components/admin/CatalogProductsPanel";
import CatalogPanel from "@/components/admin/BrandsPanel";
import CustomersPanel from "@/components/admin/CustomersPanel";
import DashboardOverview from "@/components/admin/DashboardOverview";
import OrdersPanel from "@/components/admin/OrdersPanel";
import PromotionsPanel from "@/components/admin/PromotionsPanel";
import RepairsPanel from "@/components/admin/RepairsPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { AdminDashboardStats } from "@/types";

const navIconClass = "h-4 w-4";

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
        icon: <IconDashboard className={navIconClass} />,
      },
      {
        id: "products" as const,
        label: t.admin.navProducts,
        badge: stats?.lowStockCount,
        icon: <IconProducts className={navIconClass} />,
      },
      {
        id: "catalog" as const,
        label: t.admin.navCatalog,
        icon: <IconBrands className={navIconClass} />,
      },
      {
        id: "promotions" as const,
        label: t.admin.navPromotions,
        badge: stats?.promotedProductsCount,
        icon: <IconPromotion className={navIconClass} />,
      },
      {
        id: "orders" as const,
        label: t.admin.navOrders,
        badge: stats?.totalOrders,
        icon: <IconOrders className={navIconClass} />,
      },
      {
        id: "customers" as const,
        label: t.admin.navCustomers,
        icon: <IconCustomers className={navIconClass} />,
      },
      {
        id: "repairs" as const,
        label: t.admin.navRepairs,
        badge: stats?.activeRepairs,
        icon: <IconRepair className={navIconClass} />,
      },
    ],
    [t, stats]
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
      <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-navy via-[#132238] to-brand-navy-light px-4 py-12">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-brand-electric/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />

        <form
          onSubmit={handleLogin}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <SiteLogo className="h-12 w-auto" linked={false} />
            <p className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-electric-light">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {t.admin.hubBadge}
            </p>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
              {t.admin.title}
            </h1>
            <p className="mt-2 text-sm text-white/55">{t.admin.loginDesc}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">
              {t.admin.loginSecure}
            </p>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50"
            >
              {t.admin.password}
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors focus:border-brand-electric focus:ring-2 focus:ring-brand-electric/30"
              required
              autoComplete="current-password"
            />
          </div>

          {authError && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300" role="alert">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-brand-electric to-brand-electric-dark px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-glow-electric transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
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
        <DashboardOverview
          stats={stats}
          loading={statsLoading}
          onNavigate={setActiveView}
          onRefresh={loadStats}
        />
      )}
      {activeView === "products" && <CatalogProductsPanel />}
      {activeView === "catalog" && <CatalogPanel />}
      {activeView === "promotions" && <PromotionsPanel />}
      {activeView === "orders" && <OrdersPanel />}
      {activeView === "customers" && <CustomersPanel />}
      {activeView === "repairs" && <RepairsPanel />}
    </AdminShell>
  );
}
