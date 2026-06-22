import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";
import { validateCheckoutLineItems } from "@/lib/validate-checkout";
import { CheckoutPrepareBody } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPrepareBody = await request.json();
    const { paymentIntentId, lineItems, customer, shippingAddress } = body;

    if (
      !paymentIntentId ||
      !customer?.email?.trim() ||
      !customer?.name?.trim() ||
      !shippingAddress?.addressLine1?.trim() ||
      !shippingAddress?.city?.trim() ||
      !shippingAddress?.country?.trim() ||
      !shippingAddress?.firstName?.trim() ||
      !shippingAddress?.lastName?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required checkout fields." },
        { status: 400 }
      );
    }

    const { lineItems: validatedItems, totalAmount } =
      await validateCheckoutLineItems(lineItems);

    const stripe = getStripe();
    const existing = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (existing.status === "succeeded") {
      return NextResponse.json(
        { error: "Payment already completed." },
        { status: 400 }
      );
    }

    const fullName =
      `${shippingAddress.firstName.trim()} ${shippingAddress.lastName.trim()}`.trim();

    await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(totalAmount * 100),
      receipt_email: customer.email.trim(),
      metadata: {
        customer_name: fullName,
        customer_email: customer.email.trim(),
        customer_phone: shippingAddress.phone?.trim() ?? customer.phone ?? "",
        shipping_address: JSON.stringify(shippingAddress),
        line_items: JSON.stringify(
          validatedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
    });

    return NextResponse.json({
      ok: true,
      totalAmount,
      returnUrl: `${getSiteUrl()}/checkout/success?payment_intent=${paymentIntentId}`,
    });
  } catch (error) {
    console.error("[checkout/prepare]", error);
    const message =
      error instanceof Error ? error.message : "Checkout preparation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
