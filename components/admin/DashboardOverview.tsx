"use client";

import SafeImage from "@/components/SafeImage";
import {
  IconAvgOrder,
  IconCustomers,
  IconOrders,
  IconProducts,
  IconRepair,
  IconRevenue,
  IconStock,
} from "@/components/admin/AdminStatIcons";
import { AdminView, Panel } from "@/components/admin/AdminShell";
import SalesChart from "@/components/admin/SalesChart";
import StatCard from "@/components/admin/StatCard";
import { useLanguage } from "@/components/LanguageProvider";
import { AdminDashboardStats } from "@/types";

function stockHealthLabel(
  rate: number,
  t: ReturnType<typeof useLanguage>["t"]
): { text: string; color: string } {
  if (rate >= 80) return { text: t.admin.stockHealthGood, color: "text-emerald-400" };
  if (rate >= 50) return { text: t.admin.stockHealthWarn, color: "text-amber-400" };
  return { text: t.admin.stockHealthCritical, color: "text-rose-400" };
}

export default function DashboardOverview({
  stats,
  loading,
  onNavigate,
  onRefresh,
}: {
  stats: AdminDashboardStats | null;
  loading: boolean;
  onNavigate: (view: AdminView) => void;
  onRefresh: () => void;
}) {
  const { t, formatPrice } = useLanguage();

  if (loading || !stats) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-xl border border-white/80 bg-white/90 text-sm text-brand-gray-500 shadow-card backdrop-blur-sm">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-electric border-t-transparent" />
        {t.admin.loadingDashboard}
      </div>
    );
  }

  const inStockProducts = stats.totalProducts - stats.outOfStockCount;
  const stockHealthRate =
    stats.totalProducts > 0
      ? Math.round((inStockProducts / stats.totalProducts) * 100)
      : 100;
  const health = stockHealthLabel(stockHealthRate, t);
  const catalogTotal = stats.phonesInCatalog + stats.accessoriesInCatalog;
  const phonesPct =
    catalogTotal > 0 ? Math.round((stats.phonesInCatalog / catalogTotal) * 100) : 50;

  const quickActions = [
    {
      label: t.admin.actionAddProduct,
      view: "products" as const,
      gradient: "from-brand-electric to-brand-electric-dark",
    },
    {
      label: t.admin.actionViewOrders,
      view: "orders" as const,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: t.admin.actionManageCustomers,
      view: "customers" as const,
      gradient: "from-violet-500 to-indigo-600",
    },
    {
      label: t.admin.actionRepairQueue,
      view: "repairs" as const,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-navy via-[#1a3055] to-brand-electric p-5 shadow-lg sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-electric/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-electric-light">
              {t.admin.dashboardWelcome}
            </p>
            <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {formatPrice(stats.revenueToday)}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {t.admin.revenuePulse} · {stats.ordersToday} {t.admin.ordersTodayLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="self-start rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-200 hover:border-brand-electric-light hover:bg-brand-electric/25"
          >
            {t.admin.refreshDashboard}
          </button>
        </div>
      </div>

      <Panel title={t.admin.quickActions}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.view}
              type="button"
              onClick={() => onNavigate(action.view)}
              className={`group rounded-xl bg-gradient-to-br ${action.gradient} p-4 text-left text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                {t.admin.quickActions}
              </p>
              <p className="mt-2 text-sm font-bold uppercase tracking-wide">
                {action.label}
              </p>
              <span className="mt-3 inline-block text-xs text-white/80 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={t.admin.statRevenue}
          value={formatPrice(stats.totalRevenue)}
          hint={`${t.admin.today}: ${formatPrice(stats.revenueToday)}`}
          tone="emerald"
          icon={<IconRevenue />}
        />
        <StatCard
          label={t.admin.statOrders}
          value={String(stats.totalOrders)}
          hint={`${t.admin.today}: ${stats.ordersToday}`}
          tone="electric"
          icon={<IconOrders />}
        />
        <StatCard
          label={t.admin.statAvgOrder}
          value={formatPrice(stats.averageOrderValue)}
          tone="violet"
          icon={<IconAvgOrder />}
        />
        <StatCard
          label={t.admin.statProducts}
          value={String(stats.totalProducts)}
          hint={`${stats.phonesInCatalog} ${t.admin.phonesShort} · ${stats.accessoriesInCatalog} ${t.admin.accessoriesShort}`}
          tone="navy"
          icon={<IconProducts />}
        />
        <StatCard
          label={t.admin.statStock}
          value={String(stats.totalStockUnits)}
          hint={`${stats.lowStockCount} ${t.admin.lowStock} · ${stats.outOfStockCount} ${t.admin.outOfStock}`}
          tone="amber"
          icon={<IconStock />}
        />
        <StatCard
          label={t.admin.statCustomers}
          value={String(stats.totalCustomers + stats.registeredUsers)}
          hint={`${stats.totalCustomers} ${t.admin.buyers} · ${stats.registeredUsers} ${t.admin.registered}`}
          tone="coral"
          icon={<IconCustomers />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart data={stats.salesByDay} revenueLabel={t.admin.salesLast7Days} />
        </div>
        <div className="space-y-5">
          <Panel title={t.admin.stockHealth} variant="dark">
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#1e6bff ${stockHealthRate}%, rgba(255,255,255,0.1) 0)`,
                }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy text-lg font-black text-white">
                  {stockHealthRate}%
                </div>
              </div>
              <div>
                <p className={`text-sm font-bold uppercase ${health.color}`}>
                  {health.text}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {inStockProducts} / {stats.totalProducts} {t.admin.inStockProducts}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title={t.admin.catalogMix}>
            <div className="space-y-3">
              <div className="flex h-3 overflow-hidden rounded-full bg-brand-gray-100">
                <div
                  className="bg-gradient-to-r from-brand-electric to-brand-electric-dark transition-all"
                  style={{ width: `${phonesPct}%` }}
                />
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-600 transition-all"
                  style={{ width: `${100 - phonesPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold uppercase">
                <span className="text-brand-electric">
                  {t.admin.phonesShort} {stats.phonesInCatalog}
                </span>
                <span className="text-violet-600">
                  {t.admin.accessoriesShort} {stats.accessoriesInCatalog}
                </span>
              </div>
            </div>
          </Panel>

          <Panel title={t.admin.shopHealth}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3 border-b border-brand-gray-100 pb-3">
                <span className="text-brand-gray-600">{t.admin.activeRepairs}</span>
                <span className="flex items-center gap-2 font-bold text-brand-electric">
                  <IconRepair />
                  {stats.activeRepairs}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 border-b border-brand-gray-100 pb-3">
                <span className="text-brand-gray-600">{t.admin.paidOrders}</span>
                <span className="font-bold text-emerald-600">{stats.paidOrders}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-brand-gray-600">{t.admin.catalogBreakdown}</span>
                <span className="text-right text-xs font-semibold uppercase text-brand-gray-700">
                  {stats.phonesInCatalog} / {stats.accessoriesInCatalog}
                </span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t.admin.recentOrders}>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-brand-gray-500">{t.admin.noOrdersYet}</p>
          ) : (
            <ul className="divide-y divide-brand-gray-100">
              {stats.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-start justify-between gap-3 py-3 transition-colors duration-200 first:pt-0 last:pb-0 hover:bg-brand-electric/[0.03]"
                >
                  <div>
                    <p className="text-sm font-bold text-brand-navy">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-brand-gray-500">
                      {order.customer_name} · {order.customer_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-electric">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-emerald-600">
                      {order.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t.admin.topSelling}>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-brand-gray-500">{t.admin.noSalesYet}</p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((item, index) => (
                <li
                  key={item.product_name}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-brand-electric/[0.04]"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white ${
                      index === 0
                        ? "bg-gradient-to-br from-brand-electric to-brand-electric-dark"
                        : "bg-brand-navy"
                    }`}
                  >
                    {item.quantity_sold}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-brand-gray-500">
                      {formatPrice(item.revenue)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {stats.lowStockProducts.length > 0 && (
        <Panel title={t.admin.lowStockAlert}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-3 transition-all duration-200 hover:border-amber-300 hover:shadow-sm"
              >
                <div className="relative h-12 w-12 shrink-0 rounded-lg bg-white">
                  <SafeImage
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-brand-navy">
                    {product.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-amber-700">
                    {product.stock} {t.admin.unitsLeft}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
