import { NextResponse } from "next/server";
import { logError } from "@/lib/errors";
import { mapProductRow } from "@/lib/map-product";
import { getSupabaseClientSafe } from "@/utils/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseClientSafe();

    if (!supabase) {
      return NextResponse.json({ products: [] });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[products/list]", error);
      return NextResponse.json({ products: [] });
    }

    const products = (data ?? []).map((row) =>
      mapProductRow(row as Record<string, unknown>)
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[products]", error);
    return NextResponse.json({ products: [] });
  }
}
