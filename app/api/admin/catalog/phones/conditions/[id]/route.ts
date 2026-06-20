import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseClient } from "@/utils/supabase";

function invalidatePhoneCatalog() {
  revalidateTag("catalog-brands");
  revalidateTag("catalog-phones");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const label = body.label?.toString().trim();
    const shopGroup = body.shopGroup === "used" ? "used" : body.shopGroup === "new" ? "new" : undefined;

    if (!label) {
      return NextResponse.json(
        { error: "Etichetta condizione obbligatoria." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("catalog_phone_conditions")
      .select("id, slug, label, shop_group")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Condizione non trovata." }, { status: 404 });
    }

    const update: { label: string; shop_group?: string } = { label };
    if (shopGroup) update.shop_group = shopGroup;

    const { data, error } = await supabase
      .from("catalog_phone_conditions")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidatePhoneCatalog();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/phones/conditions/patch]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase
      .from("catalog_phone_conditions")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Condizione non trovata." }, { status: 404 });
    }

    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", "phones")
      .eq("condition", existing.slug as string);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Impossibile eliminare: esistono prodotti con questa condizione." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("catalog_phone_conditions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidatePhoneCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/phones/conditions/delete]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
