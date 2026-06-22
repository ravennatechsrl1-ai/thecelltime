import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/admin-analytics";
import { sendOrderStatusUpdateEmail } from "@/lib/order-email";
import { toStatusEmailOrder } from "@/lib/order-tracking";
import { canTransitionOrderStatus } from "@/lib/order-status";
import { AdminOrderUpdatePayload, OrderStatus } from "@/types";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const body: AdminOrderUpdatePayload = await request.json();

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const { getSupabaseClientSafe } = await import("@/utils/supabase");
    const supabase = getSupabaseClientSafe();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database unavailable." },
        { status: 500 }
      );
    }

    const { data: existing, error: readError } = await supabase
      .from("shop_orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();

    if (readError || !existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const currentStatus = existing.status as OrderStatus;
    if (!canTransitionOrderStatus(currentStatus, body.status)) {
      return NextResponse.json(
        { error: "Status transition not allowed." },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(orderId, body.status);
    if (!order) {
      return NextResponse.json(
        { error: "Failed to update order." },
        { status: 500 }
      );
    }

    if (currentStatus !== body.status) {
      void sendOrderStatusUpdateEmail(toStatusEmailOrder(order));
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[admin/orders/patch]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
