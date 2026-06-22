"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ORDER_STATUS_TRANSITIONS,
  OrderFilterTab,
  isPendingFulfillment,
  orderMatchesFilterTab,
} from "@/lib/order-status";
import { OrderStatus, ShopOrder, ShippingAddress } from "@/types";

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "paid":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "processing":
      return "bg-sky-50 text-sky-800 ring-1 ring-sky-200";
    case "shipped":
      return "bg-violet-50 text-violet-800 ring-1 ring-violet-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200";
    case "cancelled":
    case "refunded":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    default:
      return "bg-brand-gray-100 text-brand-gray-600 ring-1 ring-brand-gray-200";
  }
}

function formatShippingLines(address: ShippingAddress): string[] {
  return [
    `${address.firstName} ${address.lastName}`.trim(),
    address.addressLine1,
    address.addressLine2 ?? "",
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
    address.phone ? `Tel: ${address.phone}` : "",
  ].filter(Boolean);
}

export default function OrdersPanel() {
  const { t, formatPrice } = useLanguage();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterTab, setFilterTab] = useState<OrderFilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const query = params.toString();
      const response = await fetch(
        `/api/admin/orders${query ? `?${query}` : ""}`
      );
      const data: { orders?: ShopOrder[]; error?: string } =
        await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.ordersLoadError);
      setOrders(data.orders ?? []);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : t.common.errorUnexpected);
    } finally {
      setLoading(false);
    }
  }, [search, t.admin.ordersLoadError, t.common.errorUnexpected]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => orderMatchesFilterTab(order.status, filterTab)),
    [orders, filterTab]
  );

  const tabCounts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((o) => isPendingFulfillment(o.status)).length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter(
        (o) => o.status === "cancelled" || o.status === "refunded"
      ).length,
    }),
    [orders]
  );

  const filterTabs: { id: OrderFilterTab; label: string; count: number }[] = [
    { id: "all", label: t.admin.ordersFilterAll, count: tabCounts.all },
    { id: "pending", label: t.admin.ordersFilterPending, count: tabCounts.pending },
    {
      id: "delivered",
      label: t.admin.ordersFilterDelivered,
      count: tabCounts.delivered,
    },
    {
      id: "cancelled",
      label: t.admin.ordersFilterCancelled,
      count: tabCounts.cancelled,
    },
  ];

  function orderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: t.admin.orderStatusPending,
      paid: t.admin.orderStatusPaid,
      processing: t.admin.orderStatusProcessing,
      shipped: t.admin.orderStatusShipped,
      delivered: t.admin.orderStatusDelivered,
      cancelled: t.admin.orderStatusCancelled,
      refunded: t.admin.orderStatusRefunded,
    };
    return labels[status];
  }

  async function handleStatusUpdate(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data: { order?: ShopOrder; error?: string } = await response.json();
      if (!response.ok || !data.order) {
        throw new Error(data.error ?? t.admin.ordersUpdateError);
      }
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? data.order! : order))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorUnexpected);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <Panel title={t.admin.ordersTitle}>
      <p className="mb-4 text-sm text-brand-gray-500">{t.admin.ordersHint}</p>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.admin.ordersSearchPlaceholder}
            className="min-h-[44px] flex-1 border border-brand-gray-300 px-3 text-sm outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric"
          />
          <button type="submit" className="btn-secondary w-auto shrink-0 px-5">
            {t.common.search}
          </button>
          {search ? (
            <button
              type="button"
              className="btn-secondary w-auto shrink-0 px-4"
              onClick={() => {
                setSearchInput("");
                setSearch("");
              }}
            >
              {t.admin.clearFilters}
            </button>
          ) : null}
        </form>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`inline-flex min-h-[40px] items-center gap-2 border px-4 text-xs font-bold uppercase tracking-wide transition-colors ${
              filterTab === tab.id
                ? "border-brand-electric bg-brand-electric text-white"
                : "border-brand-gray-300 bg-white text-brand-gray-700 hover:border-brand-electric hover:text-brand-electric"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                filterTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-brand-gray-100 text-brand-gray-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
      ) : filteredOrders.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-brand-gray-500">{t.admin.noOrdersYet}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const expanded = expandedId === order.id;
            const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
            const isUpdating = updatingId === order.id;

            return (
              <article
                key={order.id}
                className="border border-brand-gray-200 bg-white"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black uppercase tracking-wide text-brand-navy">
                        {order.order_number}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusBadgeClass(order.status)}`}
                      >
                        {orderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-brand-gray-800">
                      {order.customer_name}
                    </p>
                    <p className="text-xs text-brand-gray-500">
                      {order.customer_email}
                      {order.customer_phone ? ` · ${order.customer_phone}` : ""}
                    </p>
                    <p className="mt-1 text-[10px] uppercase text-brand-gray-400">
                      {new Date(order.created_at).toLocaleString()}
                      {order.delivered_at
                        ? ` · ${t.admin.orderDeliveredAt} ${new Date(order.delivered_at).toLocaleString()}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <p className="text-lg font-black text-brand-navy">
                      {formatPrice(order.total_amount)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : order.id)
                        }
                        className="border border-brand-gray-300 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-brand-gray-700 hover:border-brand-electric hover:text-brand-electric"
                      >
                        {expanded ? t.admin.orderHideDetails : t.admin.orderViewDetails}
                      </button>
                      {nextStatuses.includes("processing") ? (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(order.id, "processing")
                          }
                          className="border border-sky-300 bg-sky-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-sky-800 hover:bg-sky-100 disabled:opacity-50"
                        >
                          {t.admin.orderMarkProcessing}
                        </button>
                      ) : null}
                      {nextStatuses.includes("shipped") ? (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(order.id, "shipped")}
                          className="border border-violet-300 bg-violet-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-violet-800 hover:bg-violet-100 disabled:opacity-50"
                        >
                          {t.admin.orderMarkShipped}
                        </button>
                      ) : null}
                      {nextStatuses.includes("delivered") ? (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(order.id, "delivered")
                          }
                          className="border border-emerald-300 bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {t.admin.orderMarkDelivered}
                        </button>
                      ) : null}
                      {nextStatuses.includes("cancelled") ? (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(order.id, "cancelled")
                          }
                          className="border border-red-300 bg-red-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {t.admin.orderCancel}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {expanded ? (
                  <div className="border-t border-brand-gray-100 bg-brand-gray-50 px-4 py-4 sm:px-5">
                    {order.items && order.items.length > 0 ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">
                          {t.admin.orderItems}
                        </p>
                        <ul className="mt-2 divide-y divide-brand-gray-200 rounded border border-brand-gray-200 bg-white">
                          {order.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                            >
                              <span className="text-brand-gray-800">
                                {item.product_name}
                              </span>
                              <span className="shrink-0 font-semibold text-brand-navy">
                                {item.quantity} × {formatPrice(item.unit_price)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {order.shipping_address ? (
                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">
                          {t.admin.orderShippingAddress}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-brand-gray-700">
                          {formatShippingLines(order.shipping_address).map(
                            (line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            )
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-brand-gray-500">
                        {t.admin.orderNoShipping}
                      </p>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
