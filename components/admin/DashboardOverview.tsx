"use client";

import SafeImage from "@/components/SafeImage";
import SalesChart from "@/components/admin/SalesChart";
import StatCard from "@/components/admin/StatCard";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import { AdminDashboardStats } from "@/types";

function IconRevenue() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M10 2a1 1 0 01.993.883L11 3v1h4a1 1 0 01.117 1.993L15 6h-1v2h1a1 1 0 01.117 1.993L15 10h-1v2h1a1 1 0 01.117 1.993L15 14h-1.268A4 4 0 0110 18a4 4 0 01-3.732-2.536l-.003-.01A4 4 0 016 10V6H5a1 1 0 01-.117-1.993L5 4h1V3a1 1 0 011.993-.117L8 3v1h2V3a1 1 0 011-1z" />
    </svg>
  );
}

function IconOrders() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h10" strokeLinecap="round" />
    </svg>
  );
}

function IconProducts() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="1" />
      <path d="M7 7h6M7 10h6M7 13h4" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
    </svg>
  );
}

function IconStock() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 7l6-3 6 3v6l-6 3-6-3V7z" />
      <path d="M10 10v6" />
    </svg>
  );
}

function IconRepair() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14 4l2 2-8 8H6v-2l8-8z" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardOverview({
  stats,
  loading,
}: {
  stats: AdminDashboardStats | null;
  loading: boolean;
}) {
  const { t, formatPrice } = useLanguage();

  if (loading || !stats) {
    return (
      <div className="flex min-h-[320px] items-center justify-center border border-brand-gray-200 bg-white text-sm text-brand-gray-500">
        {t.admin.loadingDashboard}
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
          icon={<IconRevenue />}
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
          icon={<IconUsers />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart
            data={stats.salesByDay}
            revenueLabel={t.admin.salesLast7Days}
          />
        </div>
        <Panel title={t.admin.shopHealth}>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between gap-3 border-b border-brand-gray-100 pb-3">
              <span className="text-brand-gray-600">{t.admin.activeRepairs}</span>
              <span className="flex items-center gap-2 font-bold text-brand-navy">
                <IconRepair />
                {stats.activeRepairs}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-brand-gray-100 pb-3">
              <span className="text-brand-gray-600">{t.admin.paidOrders}</span>
              <span className="font-bold text-brand-navy">{stats.paidOrders}</span>
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

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={t.admin.recentOrders}>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-brand-gray-500">{t.admin.noOrdersYet}</p>
          ) : (
            <ul className="divide-y divide-brand-gray-100">
              {stats.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
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
                    <p className="text-sm font-bold">{formatPrice(order.total_amount)}</p>
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
              {stats.topProducts.map((item) => (
                <li key={item.product_name} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-brand-gray-100 text-xs font-black text-brand-navy">
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
                className="flex items-center gap-3 border border-amber-200 bg-amber-50/50 p-3"
              >
                <div className="relative h-12 w-12 shrink-0 bg-white">
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
