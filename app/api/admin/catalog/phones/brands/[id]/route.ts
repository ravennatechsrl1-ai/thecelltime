import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseClient } from "@/utils/supabase";

function invalidateBrandCatalog() {
  revalidateTag("catalog-brands");
  revalidateTag("catalog-phones");
  revalidateTag("products");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const label = body.label?.toString().trim();

    if (!label) {
      return NextResponse.json(
        { error: "Etichetta marca obbligatoria." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase
      .from("catalog_phone_brands")
      .select("id, label, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Marca non trovata." },
        { status: 404 }
      );
    }

    const oldLabel = existing.label as string;

    const { data, error } = await supabase
      .from("catalog_phone_brands")
      .update({ label })
      .eq("id", id)
      .select("id, slug, label, sort_order")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (oldLabel !== label) {
      await supabase
        .from("products")
        .update({ brand: label })
        .eq("brand", oldLabel)
        .eq("category", "phones");
    }

    invalidateBrandCatalog();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/phones/brands/patch]", error);
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
      .from("catalog_phone_brands")
      .select("id, label, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Marca non trovata." },
        { status: 404 }
      );
    }

    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", "phones")
      .eq("brand", existing.label as string);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Impossibile eliminare: esistono prodotti telefono con questa marca.",
        },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("catalog_phone_brands")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateBrandCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/phones/brands/delete]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
