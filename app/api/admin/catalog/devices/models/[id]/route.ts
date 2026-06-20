import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseClient } from "@/utils/supabase";

function invalidateDeviceCatalog() {
  revalidateTag("catalog-brands");
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
      return NextResponse.json({ error: "Etichetta modello obbligatoria." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("catalog_device_models")
      .select("id, label, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Modello non trovato." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("catalog_device_models")
      .update({ label })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDeviceCatalog();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/devices/models/patch]", error);
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
      .from("catalog_device_models")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Modello non trovato." }, { status: 404 });
    }

    const slug = existing.slug as string;
    const { count: protectionCount, error: protectionError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", "protection")
      .eq("protection_model_slug", slug);

    if (protectionError) {
      return NextResponse.json({ error: protectionError.message }, { status: 400 });
    }

    const { count: accessoryCount, error: accessoryError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", "accessories")
      .eq("accessory_model_slug", slug);

    if (accessoryError) {
      return NextResponse.json({ error: accessoryError.message }, { status: 400 });
    }

    if ((protectionCount ?? 0) + (accessoryCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Impossibile eliminare: esistono prodotti con questo modello." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("catalog_device_models")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDeviceCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/devices/models/delete]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
