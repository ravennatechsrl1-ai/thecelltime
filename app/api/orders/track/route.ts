import { NextRequest, NextResponse } from "next/server";
import { fetchOrderForTracking, normalizeOrderNumber } from "@/lib/order-tracking";

export async function POST(request: NextRequest) {
  try {
    const body: { orderNumber?: string; email?: string } = await request.json();
    const orderNumber = body.orderNumber?.trim();
    const email = body.email?.trim();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order ID and email are required." },
        { status: 400 }
      );
    }

    if (!normalizeOrderNumber(orderNumber).startsWith("TCT-")) {
      return NextResponse.json(
        { error: "Enter a valid order ID (e.g. TCT-…)." },
        { status: 400 }
      );
    }

    const order = await fetchOrderForTracking(orderNumber, email);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Check your order ID and email." },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[orders/track]", error);
    return NextResponse.json(
      { error: "Unable to look up order." },
      { status: 500 }
    );
  }
}
