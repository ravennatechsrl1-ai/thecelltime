import { OrderStatus } from "@/types";

export const PENDING_FULFILLMENT_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
];

export const REVENUE_ORDER_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

export const ORDER_STATUS_TRANSITIONS: Partial<
  Record<OrderStatus, OrderStatus[]>
> = {
  paid: ["processing", "shipped", "delivered", "cancelled"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  pending: ["cancelled"],
};

export function isPendingFulfillment(status: OrderStatus): boolean {
  return PENDING_FULFILLMENT_STATUSES.includes(status);
}

export function canTransitionOrderStatus(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  if (current === next) return true;
  const allowed = ORDER_STATUS_TRANSITIONS[current];
  return allowed?.includes(next) ?? false;
}

export type OrderFilterTab = "all" | "pending" | "delivered" | "cancelled";

export function orderMatchesFilterTab(
  status: OrderStatus,
  tab: OrderFilterTab
): boolean {
  if (tab === "all") return true;
  if (tab === "pending") return isPendingFulfillment(status);
  if (tab === "delivered") return status === "delivered";
  if (tab === "cancelled") return status === "cancelled" || status === "refunded";
  return true;
}
