import { NextResponse } from "next/server";
import Stripe from "stripe";
import { generateOrderNumber } from "@/lib/admin-analytics";
import { getStripe } from "@/lib/stripe";
import { getSupabaseClientSafe } from "@/utils/supabase";

interface CheckoutLineItemMeta {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured." },
      { status: 501 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const supabase = getSupabaseClientSafe();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database unavailable." },
      { status: 500 }
    );
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const { data: existing } = await supabase
    .from("shop_orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  let lineItems: CheckoutLineItemMeta[] = [];
  try {
    lineItems = JSON.parse(session.metadata?.line_items ?? "[]");
  } catch {
    lineItems = [];
  }

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

  const { data: order, error: orderError } = await supabase
    .from("shop_orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      total_amount: totalAmount,
      status: "paid",
      stripe_session_id: session.id,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    console.error("[stripe/webhook] order insert", orderError);
    return NextResponse.json(
      { error: "Failed to record order." },
      { status: 500 }
    );
  }

  if (lineItems.length > 0) {
    const rows = lineItems.map((item) => ({
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
      console.error("[stripe/webhook] items insert", itemsError);
    }

    for (const item of lineItems) {
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

  return NextResponse.json({ received: true });
}
