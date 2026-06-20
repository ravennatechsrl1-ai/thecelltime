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

    if (!label) {
      return NextResponse.json({ error: "Etichetta modello obbligatoria." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("catalog_phone_models")
      .select("id, label, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Modello non trovato." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("catalog_phone_models")
      .update({ label })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidatePhoneCatalog();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/phones/models/patch]", error);
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
      .from("catalog_phone_models")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Modello non trovato." }, { status: 404 });
    }

    const { error } = await supabase
      .from("catalog_phone_models")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidatePhoneCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/phones/models/delete]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
