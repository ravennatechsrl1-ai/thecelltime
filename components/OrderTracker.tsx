"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import SiteLogo from "@/components/SiteLogo";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatShippingAddressPublic,
  getOrderFulfillmentStepIndex,
  ORDER_FULFILLMENT_STEPS,
  type PublicOrderTracking,
} from "@/lib/order-tracking";
import { formatEuro } from "@/lib/constants";
import type { OrderStatus } from "@/types";

interface OrderTrackerProps {
  defaultEmail?: string;
  compact?: boolean;
}

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "shipped":
      return "bg-brand-electric/10 text-brand-electric ring-brand-electric/20";
    case "processing":
      return "bg-violet-100 text-violet-800 ring-violet-200";
    case "paid":
      return "bg-sky-100 text-sky-800 ring-sky-200";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800 ring-red-200";
    default:
      return "bg-brand-gray-100 text-brand-gray-700 ring-brand-gray-200";
  }
}

function OrderTrackerContent({ defaultEmail = "", compact = false }: OrderTrackerProps) {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [orderInput, setOrderInput] = useState(
    searchParams.get("order")?.toUpperCase() ?? ""
  );
  const [emailInput, setEmailInput] = useState(
    defaultEmail || searchParams.get("email") || ""
  );
  const [order, setOrder] = useState<PublicOrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [resultKey, setResultKey] = useState(0);

  const stepLabels = useMemo(
    () => [
      t.orderTrack.stepPaid,
      t.orderTrack.stepProcessing,
      t.orderTrack.stepShipped,
      t.orderTrack.stepDelivered,
    ],
    [t]
  );

  const fetchOrder = useCallback(
    async (orderNumber: string, email: string) => {
      const trimmedOrder = orderNumber.trim();
      const trimmedEmail = email.trim();

      if (!trimmedOrder || !trimmedEmail) {
        setError(t.orderTrack.missingFields);
        return;
      }

      setLoading(true);
      setError(null);
      setSearched(true);

      try {
        const response = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: trimmedOrder,
            email: trimmedEmail,
          }),
        });
        const data: { order?: PublicOrderTracking; error?: string } =
          await response.json();

        if (!response.ok || !data.order) {
          throw new Error(data.error ?? t.orderTrack.notFound);
        }

        setOrder(data.order);
        setResultKey((key) => key + 1);
      } catch (err) {
        setOrder(null);
        setError(err instanceof Error ? err.message : t.common.errorUnexpected);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    const initialOrder = searchParams.get("order");
    const initialEmail = defaultEmail || searchParams.get("email");
    if (initialOrder && initialEmail) {
      fetchOrder(initialOrder, initialEmail);
    }
  }, [searchParams, defaultEmail, fetchOrder]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchOrder(orderInput, emailInput);
  }

  function orderStatusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: t.admin.orderStatusPending,
      paid: t.admin.orderStatusPaid,
      processing: t.admin.orderStatusProcessing,
      shipped: t.admin.orderStatusShipped,
      delivered: t.admin.orderStatusDelivered,
      cancelled: t.admin.orderStatusCancelled,
      refunded: t.admin.orderStatusRefunded,
    };
    return map[status];
  }

  const currentStepIndex = order ? getOrderFulfillmentStepIndex(order.status) : -1;
  const isTerminal =
    order?.status === "cancelled" || order?.status === "refunded";

  return (
    <div
      className={
        compact
          ? ""
          : "relative overflow-hidden bg-brand-gray-50 py-8 sm:py-14"
      }
    >
      {!compact && (
        <div
          className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-80"
          aria-hidden="true"
        />
      )}

      <div className={compact ? "" : "container-app relative"}>
        {!compact && (
          <header className="mb-10 animate-fade-in-up text-center">
            <div className="mb-6 flex justify-center">
              <SiteLogo className="h-12 w-auto sm:h-14" priority />
            </div>
            <p className="section-title mb-2">{t.orderTrack.badge}</p>
            <h1 className="heading-lg">{t.orderTrack.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-brand-gray-600">
              {t.orderTrack.desc}
            </p>
          </header>
        )}

        <form
          onSubmit={handleSubmit}
          className={`animate-fade-in-up overflow-hidden rounded-2xl border border-brand-gray-200/80 bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover ${
            compact ? "p-5 sm:p-6" : "mx-auto mb-8 max-w-xl p-6 sm:p-8"
          }`}
          style={{ animationDelay: compact ? "0ms" : "80ms" }}
        >
          {compact && (
            <div className="mb-5 flex items-center gap-3 border-b border-brand-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-electric/10 text-brand-electric">
                <TrackIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray-400">
                  {t.orderTrack.badge}
                </p>
                <h2 className="text-lg font-black uppercase tracking-tight text-brand-navy">
                  {t.orderTrack.title}
                </h2>
              </div>
            </div>
          )}

          {!compact && (
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-electric to-brand-electric-dark text-white shadow-glow-electric">
                <TrackIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-brand-gray-600">
                {t.orderTrack.desc}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="order-track-id"
                className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-gray-500"
              >
                {t.orderTrack.orderLabel}
              </label>
              <input
                id="order-track-id"
                type="text"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value.toUpperCase())}
                className="input-field font-mono uppercase tracking-wide transition-shadow focus:shadow-glow-electric"
                placeholder={t.orderTrack.orderPlaceholder}
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="order-track-email"
                className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-brand-gray-500"
              >
                {t.orderTrack.emailLabel}
              </label>
              <input
                id="order-track-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="input-field transition-shadow focus:shadow-glow-electric"
                placeholder={t.orderTrack.emailPlaceholder}
                autoComplete="email"
                readOnly={Boolean(defaultEmail)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !orderInput.trim() || !emailInput.trim()}
            className="btn-primary mt-6 w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-electric disabled:translate-y-0 disabled:opacity-40 sm:w-auto"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                {t.orderTrack.searching}
              </span>
            ) : (
              t.orderTrack.trackButton
            )}
          </button>
        </form>

        {error && searched && (
          <div
            className={`animate-fade-in-up rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 ${
              compact ? "mt-4" : "mx-auto max-w-xl"
            }`}
          >
            {error}
          </div>
        )}

        {order && (
          <div
            key={resultKey}
            className={compact ? "mt-6 space-y-6" : "mx-auto max-w-3xl space-y-6"}
          >
            <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-brand-gray-200/80 bg-white shadow-card">
              <div className="bg-hero-gradient px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-silver/80">
                      {t.orderTrack.orderId}
                    </p>
                    <p className="mt-1 font-mono text-xl font-black tracking-wide text-white sm:text-2xl">
                      {order.orderNumber}
                    </p>
                    <p className="mt-2 text-sm text-brand-silver">{order.customerName}</p>
                  </div>
                  <div className="sm:text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ring-1 ring-inset ${statusBadgeClass(order.status)}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                    <p className="mt-3 text-2xl font-black text-white">
                      {formatEuro(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {order.items.length > 0 && (
                  <ul className="space-y-3">
                    {order.items.map((item, index) => (
                      <li
                        key={`${item.name}-${item.quantity}`}
                        className="animate-fade-in-up flex items-center justify-between gap-4 rounded-xl bg-brand-gray-50 px-4 py-3 text-sm"
                        style={{ animationDelay: `${120 + index * 80}ms` }}
                      >
                        <span className="font-medium text-brand-gray-700">
                          {item.name}
                          <span className="ml-2 text-brand-gray-400">× {item.quantity}</span>
                        </span>
                        <span className="font-bold text-brand-navy">
                          {formatEuro(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {order.shippingAddress && (
                  <div
                    className="animate-fade-in-up mt-6 rounded-xl border border-brand-gray-100 bg-white p-4"
                    style={{ animationDelay: "200ms" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500">
                      {t.orderTrack.deliveryAddress}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-gray-700">
                      {formatShippingAddressPublic(order.shippingAddress).join("\n")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isTerminal ? (
              <div className="animate-fade-in-up rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
                {order.status === "cancelled"
                  ? t.orderTrack.cancelledMessage
                  : t.orderTrack.refundedMessage}
              </div>
            ) : (
              <div
                className="animate-fade-in-up overflow-hidden rounded-2xl border border-brand-gray-200/80 bg-white p-6 shadow-card sm:p-8"
                style={{ animationDelay: "160ms" }}
              >
                <div className="lg:hidden">
                  <OrderTimelineVertical
                    labels={stepLabels}
                    currentIndex={currentStepIndex}
                    currentLabel={t.common.currentStatus}
                  />
                </div>
                <div className="hidden lg:block">
                  <OrderTimelineHorizontal
                    labels={stepLabels}
                    currentIndex={currentStepIndex}
                  />
                </div>
              </div>
            )}

            <p
              className="animate-fade-in text-center text-xs text-brand-gray-500"
              style={{ animationDelay: "280ms" }}
            >
              {t.orderTrack.lastUpdated}:{" "}
              {new Date(order.updatedAt ?? order.createdAt).toLocaleString()}
              {order.deliveredAt
                ? ` · ${t.orderTrack.deliveredAt}: ${new Date(order.deliveredAt).toLocaleString()}`
                : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TimelineProps {
  labels: string[];
  currentIndex: number;
  currentLabel?: string;
}

function OrderTimelineVertical({ labels, currentIndex, currentLabel }: TimelineProps) {
  return (
    <ol className="relative space-y-0">
      {labels.map((label, index) => {
        const stepStatus = ORDER_FULFILLMENT_STEPS[index];
        const isComplete = currentIndex >= 0 && index < currentIndex;
        const isCurrent = index === currentIndex;
        const isReached = currentIndex >= 0 && index <= currentIndex;

        return (
          <li
            key={stepStatus}
            className="animate-fade-in-up relative flex gap-4 pb-10 last:pb-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {index < labels.length - 1 && (
              <span
                className={`absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 transition-colors duration-700 ${
                  index < currentIndex
                    ? "bg-gradient-to-b from-brand-electric to-brand-electric-dark"
                    : "bg-brand-gray-200"
                }`}
              />
            )}
            <StepNode
              index={index}
              isComplete={isComplete}
              isCurrent={isCurrent}
              isReached={isReached}
            />
            <div className="pt-1.5">
              <p
                className={`text-sm font-bold uppercase tracking-wide transition-colors duration-300 ${
                  isReached ? "text-brand-navy" : "text-brand-gray-400"
                }`}
              >
                {label}
              </p>
              {isCurrent && currentLabel && (
                <p className="mt-1 animate-fade-in text-xs font-medium text-brand-electric">
                  {currentLabel}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderTimelineHorizontal({ labels, currentIndex }: TimelineProps) {
  const progress =
    currentIndex >= 0 ? (currentIndex / (labels.length - 1)) * 100 : 0;

  return (
    <div className="relative px-2 py-4">
      <div className="absolute left-10 right-10 top-[2.15rem] h-1 overflow-hidden rounded-full bg-brand-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-electric to-brand-electric-dark transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="relative flex justify-between">
        {labels.map((label, index) => {
          const stepStatus = ORDER_FULFILLMENT_STEPS[index];
          const isComplete = currentIndex >= 0 && index < currentIndex;
          const isCurrent = index === currentIndex;
          const isReached = currentIndex >= 0 && index <= currentIndex;

          return (
            <li
              key={stepStatus}
              className="animate-scale-in flex flex-col items-center text-center"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <StepNode
                index={index}
                isComplete={isComplete}
                isCurrent={isCurrent}
                isReached={isReached}
              />
              <p
                className={`mt-5 max-w-[130px] text-[11px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                  isReached ? "text-brand-navy" : "text-brand-gray-400"
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

interface StepNodeProps {
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  isReached: boolean;
}

function StepNode({ index, isComplete, isCurrent, isReached }: StepNodeProps) {
  return (
    <span
      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
        isReached
          ? "bg-gradient-to-br from-brand-electric to-brand-electric-dark text-white shadow-glow-electric"
          : "border-2 border-brand-gray-200 bg-white text-brand-gray-400"
      } ${isCurrent ? "animate-pulse-ring scale-110" : ""}`}
    >
      {isComplete ? <CheckIcon className="h-4 w-4" /> : index + 1}
    </span>
  );
}

function TrackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 10.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5M23 6l-9.5 6L4 6M1 6h22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function OrderTrackerFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-brand-gray-50 py-20">
      <div className="flex flex-col items-center gap-3 text-sm text-brand-gray-500">
        <SpinnerIcon className="h-8 w-8 animate-spin text-brand-electric" />
        {t.orderTrack.loading}
      </div>
    </div>
  );
}

export default function OrderTracker(props: OrderTrackerProps) {
  return (
    <Suspense fallback={<OrderTrackerFallback />}>
      <OrderTrackerContent {...props} />
    </Suspense>
  );
}
