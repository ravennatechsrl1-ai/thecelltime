import { NextRequest, NextResponse } from "next/server";
import { mapProductRow } from "@/lib/map-product";
import { getSupabaseClient } from "@/utils/supabase";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

function parsePromotionPercent(
  body: unknown
):
  | { ok: true; promotionPercent: number | null }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "promotion_percent is required." };
  }

  if (!("promotion_percent" in body)) {
    return { ok: false, error: "promotion_percent is required." };
  }

  const raw = (body as { promotion_percent: unknown }).promotion_percent;

  if (raw === undefined) {
    return { ok: false, error: "promotion_percent is required." };
  }

  if (raw === null || raw === 0) {
    return { ok: true, promotionPercent: null };
  }

  if (
    typeof raw !== "number" ||
    !Number.isInteger(raw) ||
    raw < 1 ||
    raw > 100
  ) {
    return {
      ok: false,
      error: "Promotion must be an integer between 1 and 100.",
    };
  }

  return { ok: true, promotionPercent: raw };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { productId } = await params;
    const body: unknown = await request.json();
    const parsed = parsePromotionPercent(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { promotionPercent } = parsed;
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
