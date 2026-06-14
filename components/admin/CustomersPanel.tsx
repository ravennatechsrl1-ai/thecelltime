"use client";

import { useCallback, useEffect, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import { AdminCustomer } from "@/types";

export default function CustomersPanel() {
  const { t, formatPrice } = useLanguage();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/customers");
      const data: { customers?: AdminCustomer[] } = await response.json();
      setCustomers(data.customers ?? []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <Panel title={t.admin.customersTitle}>
      {loading ? (
        <p className="text-sm text-brand-gray-500">{t.common.loading}</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-brand-gray-500">{t.admin.noCustomersYet}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-brand-gray-200 bg-brand-gray-50 text-xs font-bold uppercase tracking-wide text-brand-gray-500">
              <tr>
                <th className="px-3 py-3">{t.admin.colCustomer}</th>
                <th className="px-3 py-3">{t.admin.colOrders}</th>
                <th className="px-3 py-3">{t.admin.colSpent}</th>
                <th className="px-3 py-3">{t.admin.colLastOrder}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.email} className="border-b border-brand-gray-100 last:border-0">
                  <td className="px-3 py-3">
                    <p className="font-medium text-brand-navy">{customer.name}</p>
                    <p className="text-xs text-brand-gray-500">{customer.email}</p>
                  </td>
                  <td className="px-3 py-3 font-semibold">{customer.orders_count}</td>
                  <td className="px-3 py-3 font-semibold">
                    {formatPrice(customer.total_spent)}
                  </td>
                  <td className="px-3 py-3 text-xs text-brand-gray-500">
                    {customer.last_order_at
                      ? new Date(customer.last_order_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
