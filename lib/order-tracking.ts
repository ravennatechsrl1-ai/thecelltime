import type { OrderStatus, ShippingAddress, ShopOrder } from "@/types";
import { getSupabaseAdminClientSafe } from "@/utils/supabase";

export const ORDER_FULFILLMENT_STEPS: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

export interface PublicOrderTracking {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string | null;
  deliveredAt: string | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  shippingAddress: ShippingAddress | null;
}

export function normalizeOrderNumber(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeOrderEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function getOrderFulfillmentStepIndex(status: OrderStatus): number {
  if (status === "cancelled" || status === "refunded" || status === "pending") {
    return -1;
  }
  const index = ORDER_FULFILLMENT_STEPS.indexOf(status);
  return index >= 0 ? index : -1;
}

export function formatShippingAddressPublic(
  address: ShippingAddress | null | undefined
): string[] {
  if (!address) return [];
  return [
    `${address.firstName} ${address.lastName}`.trim(),
    address.addressLine1,
    address.addressLine2,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
  ].filter((line): line is string => Boolean(line?.trim()));
}

function mapPublicOrder(
  row: Record<string, unknown>,
  items: Record<string, unknown>[]
): PublicOrderTracking {
  const shippingRaw = row.shipping_address;
  let shippingAddress: ShippingAddress | null = null;
  if (shippingRaw && typeof shippingRaw === "object" && !Array.isArray(shippingRaw)) {
    shippingAddress = shippingRaw as ShippingAddress;
  }

  return {
    orderNumber: row.order_number as string,
    customerName: row.customer_name as string,
    status: row.status as OrderStatus,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? null,
    deliveredAt: (row.delivered_at as string | null) ?? null,
    items: items.map((item) => ({
      name: item.product_name as string,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
    })),
    shippingAddress,
  };
}

export async function fetchOrderForTracking(
  orderNumber: string,
  email: string
): Promise<PublicOrderTracking | null> {
  const supabase = getSupabaseAdminClientSafe();
  if (!supabase) return null;

  const normalizedNumber = normalizeOrderNumber(orderNumber);
  const normalizedEmail = normalizeOrderEmail(email);

  if (!normalizedNumber || !normalizedEmail) return null;

  const { data: row, error } = await supabase
    .from("shop_orders")
    .select("*")
    .eq("order_number", normalizedNumber)
    .maybeSingle();

  if (error || !row) return null;

  if (normalizeOrderEmail(row.customer_email as string) !== normalizedEmail) {
    return null;
  }

  const { data: items } = await supabase
    .from("shop_order_items")
    .select("product_name, quantity, unit_price")
    .eq("order_id", row.id as string);

  return mapPublicOrder(row as Record<string, unknown>, items ?? []);
}

export function toStatusEmailOrder(order: ShopOrder): {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
} {
  return {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    status: order.status,
  };
}
