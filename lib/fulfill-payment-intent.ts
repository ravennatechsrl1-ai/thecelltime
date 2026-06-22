import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateOrderNumber } from "@/lib/admin-analytics";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import type { ShippingAddress } from "@/types";

interface CheckoutLineItemMeta {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface FulfillCheckoutResult {
  orderId: string;
  orderNumber: string;
  duplicate: boolean;
}

function parseLineItems(raw: string | undefined): CheckoutLineItemMeta[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CheckoutLineItemMeta[];
  } catch {
    return [];
  }
}

function parseShippingAddress(
  raw: string | undefined
): ShippingAddress | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ShippingAddress;
  } catch {
    return null;
  }
}

async function insertOrderFromCheckout(
  supabase: SupabaseClient,
  input: {
    stripeSessionId?: string | null;
    stripePaymentIntentId?: string | null;
    totalAmount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    shippingAddress: ShippingAddress | null;
    lineItems: CheckoutLineItemMeta[];
  }
): Promise<FulfillCheckoutResult> {
  if (input.stripePaymentIntentId) {
    const { data: existingPi } = await supabase
      .from("shop_orders")
      .select("id, order_number")
      .eq("stripe_payment_intent_id", input.stripePaymentIntentId)
      .maybeSingle();

    if (existingPi) {
      return {
        orderId: existingPi.id as string,
        orderNumber: existingPi.order_number as string,
        duplicate: true,
      };
    }
  }

  if (input.stripeSessionId) {
    const { data: existingSession } = await supabase
      .from("shop_orders")
      .select("id, order_number")
      .eq("stripe_session_id", input.stripeSessionId)
      .maybeSingle();

    if (existingSession) {
      return {
        orderId: existingSession.id as string,
        orderNumber: existingSession.order_number as string,
        duplicate: true,
      };
    }
  }

  const { data: order, error: orderError } = await supabase
    .from("shop_orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      total_amount: input.totalAmount,
      status: "paid",
      stripe_session_id: input.stripeSessionId ?? null,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
      shipping_address: input.shippingAddress,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("[fulfill-checkout] order insert", orderError);
    throw new Error("Failed to record order.");
  }

  if (input.lineItems.length > 0) {
    const rows = input.lineItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId || null,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("shop_order_items")
      .insert(rows);

    if (itemsError) {
      console.error("[fulfill-checkout] items insert", itemsError);
    }

    for (const item of input.lineItems) {
      if (!item.productId) continue;
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .maybeSingle();

      if (product) {
        const nextStock = Math.max(0, Number(product.stock) - item.quantity);
        await supabase
          .from("products")
          .update({ stock: nextStock })
          .eq("id", item.productId);
      }
    }
  }

  const result: FulfillCheckoutResult = {
    orderId: order.id as string,
    orderNumber: order.order_number as string,
    duplicate: false,
  };

  void sendOrderConfirmationEmail({
    orderNumber: result.orderNumber,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    totalAmount: input.totalAmount,
    lineItems: input.lineItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
    shippingAddress: input.shippingAddress,
  });

  return result;
}

export async function fulfillCheckoutSession(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<FulfillCheckoutResult | null> {
  if (session.payment_status !== "paid") {
    return null;
  }

  const lineItems = parseLineItems(session.metadata?.line_items);
  const totalAmount = (session.amount_total ?? 0) / 100;
  const customerName =
    session.metadata?.customer_name ??
    session.customer_details?.name ??
    "Customer";
  const customerEmail =
    session.customer_email ??
    session.customer_details?.email ??
    "unknown@thecelltime.com";
  const customerPhone = session.metadata?.customer_phone || null;
  const shippingAddress = parseShippingAddress(
    session.metadata?.shipping_address
  );

  return insertOrderFromCheckout(supabase, {
    stripeSessionId: session.id,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    lineItems,
  });
}

export async function fulfillPaymentIntent(
  supabase: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent
): Promise<FulfillCheckoutResult | null> {
  if (paymentIntent.status !== "succeeded") {
    return null;
  }

  const lineItems = parseLineItems(paymentIntent.metadata?.line_items);
  const totalAmount =
    (paymentIntent.amount_received ?? paymentIntent.amount) / 100;
  const customerName = paymentIntent.metadata?.customer_name ?? "Customer";
  const customerEmail =
    paymentIntent.receipt_email ??
    paymentIntent.metadata?.customer_email ??
    "unknown@thecelltime.com";
  const customerPhone = paymentIntent.metadata?.customer_phone || null;
  const shippingAddress = parseShippingAddress(
    paymentIntent.metadata?.shipping_address
  );

  return insertOrderFromCheckout(supabase, {
    stripePaymentIntentId: paymentIntent.id,
    totalAmount,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    lineItems,
  });
}
