import { NextRequest, NextResponse } from "next/server";
import {
  fulfillCheckoutSession,
  fulfillPaymentIntent,
} from "@/lib/fulfill-payment-intent";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdminClientSafe } from "@/utils/supabase";

/** Backup fulfillment when Stripe webhook is missing or delayed. */
export async function POST(request: NextRequest) {
  try {
    const body: { sessionId?: string; paymentIntentId?: string } =
      await request.json();
    const sessionId = body.sessionId?.trim();
    const paymentIntentId = body.paymentIntentId?.trim();

    if (!sessionId && !paymentIntentId) {
      return NextResponse.json(
        { error: "Session or payment intent ID required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClientSafe();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database unavailable." },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    if (paymentIntentId) {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      const result = await fulfillPaymentIntent(supabase, paymentIntent);
      if (!result) {
        return NextResponse.json(
          { error: "Payment not completed." },
          { status: 400 }
        );
      }
      return NextResponse.json(result);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId!);
    const result = await fulfillCheckoutSession(supabase, session);
    if (!result) {
      return NextResponse.json(
        { error: "Payment not completed." },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[checkout/confirm]", error);
    const message =
      error instanceof Error ? error.message : "Confirmation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
