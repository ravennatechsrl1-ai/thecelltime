"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { STATUS_DB_TO_KEY } from "@/lib/i18n";
import { Translations } from "@/lib/i18n/types";
import { RepairTicket, RepairTicketStatus } from "@/types";

const STATUS_ORDER: (keyof Translations["status"])[] = [
  "received",
  "diagnostics",
  "repairing",
  "ready",
];

function TrackContent() {
  const searchParams = useSearchParams();
  const { t, tStatus, tIssue } = useLanguage();
  const [ticketInput, setTicketInput] = useState(
    searchParams.get("ticket")?.toUpperCase() ?? ""
  );
  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const statusLabels = useMemo(
    () => STATUS_ORDER.map((key) => t.status[key]),
    [t]
  );

  const fetchTicket = useCallback(
    async (id: string) => {
      if (id.length !== 6) {
        setError(t.track.invalidId);
        return;
      }

      setLoading(true);
      setError(null);
      setSearched(true);

      try {
        const response = await fetch(`/api/track/${encodeURIComponent(id)}`);
        const data: { ticket?: RepairTicket; error?: string } =
          await response.json();

        if (!response.ok || !data.ticket) {
          throw new Error(data.error ?? t.track.notFound);
        }

        setTicket(data.ticket);
      } catch (err) {
        setTicket(null);
        setError(err instanceof Error ? err.message : t.common.errorUnexpected);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    const initial = searchParams.get("ticket");
    if (initial && initial.length === 6) {
      fetchTicket(initial.toUpperCase());
    }
  }, [searchParams, fetchTicket]);

  useEffect(() => {
    if (!ticket) return;

    const ticketId = ticket.ticket_id;
    let active = true;

    async function subscribeRealtime() {
      try {
        const { getSupabaseClient } = await import("@/utils/supabase");
        const client = getSupabaseClient();

        const channel = client
          .channel(`ticket-${ticketId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "repair_tickets",
              filter: `ticket_id=eq.${ticketId}`,
            },
            (payload) => {
              if (!active) return;
              const updated = payload.new as RepairTicket;
              setTicket(updated);
            }
          )
          .subscribe();

        return channel;
      } catch {
        return null;
      }
    }

    const channelPromise = subscribeRealtime();

    return () => {
      active = false;
      channelPromise.then((channel) => {
        if (channel) {
          import("@/utils/supabase").then(({ getSupabaseClient }) => {
            getSupabaseClient().removeChannel(channel);
          });
        }
      });
    };
  }, [ticket]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchTicket(ticketInput.trim().toUpperCase());
  }

  const currentStatusIndex = ticket
    ? STATUS_ORDER.indexOf(STATUS_DB_TO_KEY[ticket.status as RepairTicketStatus])
    : -1;

  return (
    <div className="container-app py-6 sm:py-10">
      <header className="mb-8">
        <p className="section-title mb-2">{t.track.badge}</p>
        <h1 className="heading-lg">{t.track.title}</h1>
        <p className="mt-2 text-sm text-brand-gray-600">{t.track.desc}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-10 max-w-md border border-brand-gray-200 p-5 sm:p-6"
      >
        <label
          htmlFor="ticket-id"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-gray-500"
        >
          {t.track.ticketLabel}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="ticket-id"
            type="text"
            value={ticketInput}
            onChange={(e) =>
              setTicketInput(e.target.value.toUpperCase().slice(0, 6))
            }
            className="input-field flex-1 font-mono uppercase tracking-[0.2em]"
            placeholder={t.track.placeholder}
            maxLength={6}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || ticketInput.length !== 6}
            className="btn-primary sm:w-auto sm:min-w-[140px] disabled:opacity-40"
          >
            {loading ? t.track.searching : t.common.search}
          </button>
        </div>
      </form>

      {error && searched && (
        <div className="mx-auto max-w-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {ticket && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 border border-brand-gray-200 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-500">
                  {t.track.ticket}
                </p>
                <p className="font-mono text-2xl font-black tracking-[0.2em]">
                  {ticket.ticket_id}
                </p>
              </div>
              <div className="text-sm text-brand-gray-600">
                <p>
                  <strong>{ticket.device_brand}</strong> {ticket.device_model}
                </p>
                <p>{tIssue(ticket.issue)}</p>
                <p className="mt-1 text-xs font-semibold uppercase">
                  {tStatus(ticket.status as RepairTicketStatus)}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <TimelineVertical
              labels={statusLabels}
              currentIndex={currentStatusIndex}
              currentLabel={t.common.currentStatus}
            />
          </div>

          <div className="hidden lg:block">
            <TimelineHorizontal labels={statusLabels} currentIndex={currentStatusIndex} />
          </div>
        </div>
      )}
    </div>
  );
}

interface TimelineProps {
  labels: string[];
  currentIndex: number;
  currentLabel?: string;
}

function TimelineVertical({ labels, currentIndex, currentLabel }: TimelineProps) {
  return (
    <ol className="relative space-y-0">
      {labels.map((label, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={label} className="relative flex gap-4 pb-8 last:pb-0">
            {index < labels.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${
                  index < currentIndex ? "bg-brand-black" : "bg-brand-gray-200"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center border-2 text-xs font-bold ${
                isComplete
                  ? "border-brand-black bg-brand-black text-white"
                  : "border-brand-gray-300 bg-white text-brand-gray-400"
              } ${isCurrent ? "ring-2 ring-brand-black ring-offset-2" : ""}`}
            >
              {index + 1}
            </span>
            <div className="pt-1">
              <p
                className={`text-sm font-bold uppercase tracking-wide ${
                  isComplete ? "text-brand-black" : "text-brand-gray-400"
                }`}
              >
                {label}
              </p>
              {isCurrent && currentLabel && (
                <p className="mt-1 text-xs text-brand-gray-500">{currentLabel}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TimelineHorizontal({ labels, currentIndex }: TimelineProps) {
  return (
    <div className="relative px-4 py-8">
      <div className="absolute left-8 right-8 top-[calc(2rem+16px)] h-0.5 bg-brand-gray-200">
        <div
          className="h-full bg-brand-black transition-all duration-500"
          style={{
            width:
              currentIndex >= 0
                ? `${(currentIndex / (labels.length - 1)) * 100}%`
                : "0%",
          }}
        />
      </div>

      <ol className="relative flex justify-between">
        {labels.map((label, index) => {
          const isComplete = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={label} className="flex flex-col items-center text-center">
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center border-2 text-xs font-bold ${
                  isComplete
                    ? "border-brand-black bg-brand-black text-white"
                    : "border-brand-gray-300 bg-white text-brand-gray-400"
                } ${isCurrent ? "ring-2 ring-brand-black ring-offset-2" : ""}`}
              >
                {index + 1}
              </span>
              <p
                className={`mt-4 max-w-[120px] text-xs font-bold uppercase tracking-wide ${
                  isComplete ? "text-brand-black" : "text-brand-gray-400"
                }`}
              >
                {label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TrackFallback() {
  const { t } = useLanguage();
  return (
    <div className="container-app py-20 text-center text-sm text-brand-gray-500">
      {t.track.loading}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackFallback />}>
      <TrackContent />
    </Suspense>
  );
}
