import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { validateCheckoutLineItems } from "@/lib/validate-checkout";
import { CheckoutLineItem } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: { lineItems?: CheckoutLineItem[] } = await request.json();

    if (!body.lineItems?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const { lineItems, totalAmount } = await validateCheckoutLineItems(
      body.lineItems
    );

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return NextResponse.json(
        { error: "Stripe publishable key not configured." },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        line_items: JSON.stringify(
          lineItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
    });

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: "Unable to start payment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey,
      totalAmount,
      lineItems,
    });
  } catch (error) {
    console.error("[checkout/intent]", error);
    const message =
      error instanceof Error ? error.message : "Checkout error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
