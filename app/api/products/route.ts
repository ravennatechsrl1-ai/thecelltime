import { NextResponse } from "next/server";
import { logError } from "@/lib/errors";
import { getSupabaseClientSafe } from "@/utils/supabase";
import { Product } from "@/types";

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

    const products: Product[] = (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      price: Number(row.price),
      category: row.category as Product["category"],
      condition: row.condition as Product["condition"],
      brand: row.brand as string,
      image_url: row.image_url as string,
      stock: Number(row.stock),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[products]", error);
    return NextResponse.json({ products: [] });
  }
}
