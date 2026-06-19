import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseClient } from "@/utils/supabase";

function invalidateRepairTypes() {
  revalidateTag("catalog-repairs");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseClient();

    const updates: Record<string, unknown> = {};

    if (body.label !== undefined) {
      const label = body.label?.toString().trim();
      if (!label) {
        return NextResponse.json({ error: "Label is required." }, { status: 400 });
      }
      updates.label = label;
    }

    if (body.basePrice !== undefined) {
      const basePrice = Number(body.basePrice);
      if (!Number.isFinite(basePrice) || basePrice < 0) {
        return NextResponse.json(
          { error: "Valid base price is required." },
          { status: 400 }
        );
      }
      updates.base_price = basePrice;
    }

    if (body.isActive !== undefined) {
      updates.is_active = Boolean(body.isActive);
    }

    if (body.sortOrder !== undefined) {
      updates.sort_order = Number(body.sortOrder) || 0;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("catalog_repair_types")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateRepairTypes();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/repairs/patch]", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("catalog_repair_types")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateRepairTypes();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/repairs/delete]", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
