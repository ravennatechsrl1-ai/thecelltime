import { NextRequest, NextResponse } from "next/server";
import { fetchAllOrders } from "@/lib/admin-analytics";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("q") ?? undefined;
    const orders = await fetchAllOrders({ search });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[admin/orders]", error);
    return NextResponse.json(
      { error: "Failed to load orders." },
      { status: 500 }
    );
  }
}
