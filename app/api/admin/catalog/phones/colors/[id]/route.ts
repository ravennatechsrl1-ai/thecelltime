import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseClient } from "@/utils/supabase";

function invalidatePhoneCatalog() {
  revalidateTag("catalog-brands");
  revalidateTag("catalog-phones");
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  return "#64748b";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const label = body.label?.toString().trim();
    const hexColor =
      body.hexColor != null
        ? normalizeHex(body.hexColor.toString())
        : undefined;

    if (!label) {
      return NextResponse.json({ error: "Colore obbligatorio." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("catalog_phone_colors")
      .select("id, label, hex_color")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Colore non trovato." }, { status: 404 });
    }

    const oldLabel = existing.label as string;
    const patch: Record<string, string> = { label };
    if (hexColor) patch.hex_color = hexColor;

    const { data, error } = await supabase
      .from("catalog_phone_colors")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (oldLabel !== label) {
      await supabase
        .from("products")
        .update({ color: label })
        .eq("category", "phones")
        .eq("color", oldLabel);
    }

    invalidatePhoneCatalog();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/phones/colors/patch]", error);
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
      .from("catalog_phone_colors")
      .select("id, label")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Colore non trovato." }, { status: 404 });
    }

    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", "phones")
      .eq("color", existing.label as string);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Impossibile eliminare: esistono prodotti con questo colore." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("catalog_phone_colors")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidatePhoneCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/phones/colors/delete]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
