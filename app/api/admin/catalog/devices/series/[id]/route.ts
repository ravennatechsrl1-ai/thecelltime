import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseClient } from "@/utils/supabase";

function invalidateDeviceCatalog() {
  revalidateTag("catalog-brands");
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
      return NextResponse.json({ error: "Etichetta serie obbligatoria." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("catalog_device_series")
      .select("id, label, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Serie non trovata." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("catalog_device_series")
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
    console.error("[admin/catalog/devices/series/patch]", error);
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
      .from("catalog_device_series")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Serie non trovata." }, { status: 404 });
    }

    const { count, error: countError } = await supabase
      .from("catalog_device_models")
      .select("*", { count: "exact", head: true })
      .eq("series_id", id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Impossibile eliminare: esistono modelli in questa serie." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("catalog_device_series")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateDeviceCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/devices/series/delete]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
