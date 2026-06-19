import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { slugify } from "@/lib/catalog-brands-sync";
import {
  EMPTY_REPAIR_TYPES,
  fetchRepairTypes,
} from "@/lib/repair-catalog-service";
import { getSupabaseClient } from "@/utils/supabase";

function invalidateRepairTypes() {
  revalidateTag("catalog-repairs");
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const types = await fetchRepairTypes(supabase);
    return NextResponse.json({ types });
  } catch (error) {
    console.error("[admin/catalog/repairs/get]", error);
    return NextResponse.json({ types: EMPTY_REPAIR_TYPES }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const label = body.label?.toString().trim();
    const basePrice = Number(body.basePrice);

    if (!label) {
      return NextResponse.json(
        { error: "Repair type label is required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return NextResponse.json(
        { error: "Valid base price is required." },
        { status: 400 }
      );
    }

    const slug = body.slug?.toString().trim() || slugify(label);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("catalog_repair_types")
      .insert({
        slug,
        label,
        base_price: basePrice,
        sort_order: body.sortOrder ?? 999,
        is_active: body.isActive !== false,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateRepairTypes();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/repairs/post]", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
