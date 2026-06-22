import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";
import { CheckoutRequestBody } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();

    if (!body.lineItems?.length || body.totalAmount <= 0) {
      return NextResponse.json(
        { error: "Carrello vuoto o importo non valido." },
        { status: 400 }
      );
    }

    if (!body.customer?.email || !body.customer?.name) {
      return NextResponse.json(
        { error: "Dati cliente mancanti (nome ed email obbligatori)." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      currency: "eur",
      customer_email: body.customer.email,
      line_items: body.lineItems.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        customer_name: body.customer.name,
        customer_phone: body.customer.phone ?? "",
        line_items: JSON.stringify(
          body.lineItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
      payment_intent_data: {
        receipt_email: body.customer.email,
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossibile creare la sessione di checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[checkout]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
