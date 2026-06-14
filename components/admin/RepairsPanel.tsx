"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/admin/AdminShell";
import { useLanguage } from "@/components/LanguageProvider";
import { REPAIR_STATUSES } from "@/lib/constants";
import { RepairTicket, RepairTicketStatus } from "@/types";

export default function RepairsPanel() {
  const { t, formatPrice, tStatus, tIssue } = useLanguage();
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusOptions = useMemo(
    () => REPAIR_STATUSES as unknown as RepairTicketStatus[],
    []
  );

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tickets");
      const data: { tickets?: RepairTicket[]; error?: string } =
        await response.json();
      if (!response.ok) throw new Error(data.error ?? t.admin.uploadError);
      setTickets(data.tickets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorUnexpected);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  async function handleStatusChange(
    ticketId: string,
    status: RepairTicketStatus
  ) {
    setUpdatingId(ticketId);
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data: { ticket?: RepairTicket; error?: string } =
        await response.json();
      if (!response.ok || !data.ticket) {
        throw new Error(data.error ?? t.common.errorUnexpected);
      }
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticket_id === ticketId ? data.ticket! : ticket
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorUnexpected);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Panel title={t.admin.tickets}>
      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-brand-gray-500">{t.admin.loadingTickets}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-brand-gray-200 bg-brand-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  {t.admin.colTicket}
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  {t.admin.colCustomer}
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  {t.admin.colDevice}
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  {t.admin.colEstimate}
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  {t.admin.colStatus}
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-brand-gray-500">
                    {t.admin.noTickets}
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-brand-gray-100 last:border-0">
                    <td className="px-4 py-3 font-mono font-bold">{ticket.ticket_id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{ticket.customer_name}</p>
                      <p className="text-xs text-brand-gray-500">{ticket.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{ticket.device_brand} {ticket.device_model}</p>
                      <p className="text-xs text-brand-gray-500">{tIssue(ticket.issue)}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(Number(ticket.estimated_price))}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(
                            ticket.ticket_id,
                            e.target.value as RepairTicketStatus
                          )
                        }
                        disabled={updatingId === ticket.ticket_id}
                        className="min-h-[44px] w-full min-w-[160px] border border-brand-gray-300 bg-white px-3 py-2 text-xs font-semibold uppercase disabled:opacity-50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {tStatus(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
