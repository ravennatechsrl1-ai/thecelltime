import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseClient } from "@/utils/supabase";

function invalidateBrandCatalog() {
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
      return NextResponse.json(
        { error: "Etichetta marca obbligatoria." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase
      .from("catalog_device_brands")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Marca non trovata." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("catalog_device_brands")
      .update({ label })
      .eq("id", id)
      .select("id, device_type, slug, label, sort_order")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateBrandCatalog();
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error("[admin/catalog/devices/brands/patch]", error);
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
      .from("catalog_device_brands")
      .select("id, slug, device_type")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Marca non trovata." },
        { status: 404 }
      );
    }

    const slug = existing.slug as string;
    const deviceType = existing.device_type as string;

    const [protectionRes, accessoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category", "protection")
        .eq("protection_device_type", deviceType)
        .eq("protection_brand_slug", slug),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category", "accessories")
        .eq("accessory_device_type", deviceType)
        .eq("accessory_brand_slug", slug),
    ]);

    if (protectionRes.error) {
      return NextResponse.json(
        { error: protectionRes.error.message },
        { status: 400 }
      );
    }
    if (accessoriesRes.error) {
      return NextResponse.json(
        { error: accessoriesRes.error.message },
        { status: 400 }
      );
    }

    const productCount = (protectionRes.count ?? 0) + (accessoriesRes.count ?? 0);
    if (productCount > 0) {
      return NextResponse.json(
        {
          error:
            "Impossibile eliminare: esistono prodotti con questa marca.",
        },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("catalog_device_brands")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateBrandCatalog();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/catalog/devices/brands/delete]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
