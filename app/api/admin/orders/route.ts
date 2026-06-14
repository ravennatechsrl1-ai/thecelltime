import { NextResponse } from "next/server";
import { fetchAllOrders } from "@/lib/admin-analytics";

export async function GET() {
  try {
    const orders = await fetchAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[admin/orders]", error);
    return NextResponse.json(
      { error: "Failed to load orders." },
      { status: 500 }
    );
  }
}
