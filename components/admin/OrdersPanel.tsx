"use client";

import { useCallback, useEffect, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import { ShopOrder } from "@/types";

export default function OrdersPanel() {
  const { t, formatPrice } = useLanguage();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/orders");
      const data: { orders?: ShopOrder[] } = await response.json();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <Panel title={t.admin.ordersTitle}>
      {loading ? (
        <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-brand-gray-500">{t.admin.noOrdersYet}</p>
          <p className="mt-2 text-xs text-brand-gray-400">{t.admin.ordersHint}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border border-brand-gray-200 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-brand-navy">
                    {order.order_number}
                  </p>
                  <p className="mt-1 text-sm text-brand-gray-700">
                    {order.customer_name}
                  </p>
                  <p className="text-xs text-brand-gray-500">
                    {order.customer_email}
                    {order.customer_phone ? ` · ${order.customer_phone}` : ""}
                  </p>
                  <p className="mt-1 text-[10px] uppercase text-brand-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-black text-brand-navy">
                    {formatPrice(order.total_amount)}
                  </p>
                  <span
                    className={`mt-1 inline-block text-[10px] font-bold uppercase ${
                      order.status === "paid"
                        ? "text-emerald-600"
                        : "text-brand-gray-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <ul className="mt-4 divide-y divide-brand-gray-100 border-t border-brand-gray-100 pt-3">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      <span className="text-brand-gray-700">
                        {item.product_name}
                      </span>
                      <span className="shrink-0 font-semibold text-brand-navy">
                        {item.quantity} × {formatPrice(item.unit_price)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}
