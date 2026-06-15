import { NextRequest, NextResponse } from "next/server";
import { mapProductRow } from "@/lib/map-product";
import { getSupabaseClient } from "@/utils/supabase";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { productId } = await params;
    const body: { promotion_percent?: number | null } = await request.json();

    if (!("promotion_percent" in body)) {
      return NextResponse.json(
        { error: "promotion_percent is required." },
        { status: 400 }
      );
    }

    const raw = body.promotion_percent;
    if (raw === undefined) {
      return NextResponse.json(
        { error: "promotion_percent is required." },
        { status: 400 }
      );
    }

    let promotionPercent: number | null = raw;

    if (promotionPercent === null || promotionPercent === 0) {
      promotionPercent = null;
    } else if (
      typeof promotionPercent !== "number" ||
      !Number.isInteger(promotionPercent) ||
      promotionPercent < 1 ||
      promotionPercent > 100
    ) {
      return NextResponse.json(
        { error: "Promotion must be an integer between 1 and 100." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update({ promotion_percent: promotionPercent })
      .eq("id", productId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[admin/products/promotion]", error);
      return NextResponse.json(
        { error: "Could not update promotion." },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: mapProductRow(data) });
  } catch (error) {
    console.error("[admin/products/promotion]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
