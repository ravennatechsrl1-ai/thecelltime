import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  fulfillCheckoutSession,
  fulfillPaymentIntent,
} from "@/lib/fulfill-payment-intent";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdminClientSafe } from "@/utils/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set");
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

  const supabase = getSupabaseAdminClientSafe();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database unavailable." },
      { status: 500 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillCheckoutSession(supabase, session);
    } else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await fulfillPaymentIntent(supabase, paymentIntent);
    }
  } catch (error) {
    console.error("[stripe/webhook] fulfill", error);
    return NextResponse.json(
      { error: "Failed to record order." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
