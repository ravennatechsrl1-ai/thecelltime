import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { mapProductRow } from "@/lib/map-product";
import { getSupabaseClient } from "@/utils/supabase";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

function parseFrozen(
  body: unknown
): { ok: true; frozen: boolean } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || !("frozen" in body)) {
    return { ok: false, error: "frozen is required." };
  }

  const frozen = (body as { frozen: unknown }).frozen;
  if (typeof frozen !== "boolean") {
    return { ok: false, error: "frozen must be a boolean." };
  }

  return { ok: true, frozen };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { productId } = await params;
    const body: unknown = await request.json();
    const parsed = parseFrozen(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
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
      .update({ frozen: parsed.frozen })
      .eq("id", productId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[admin/products/freeze]", error);
      return NextResponse.json(
        { error: "Could not update product visibility." },
        { status: 500 }
      );
    }

    revalidateTag("products");

    return NextResponse.json({ product: mapProductRow(data) });
  } catch (error) {
    console.error("[admin/products/freeze]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
