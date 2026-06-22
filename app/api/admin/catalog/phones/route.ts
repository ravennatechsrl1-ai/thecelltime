import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  fetchPhoneCatalog,
  EMPTY_PHONE_CATALOG,
} from "@/lib/catalog-service";
import { addPhoneCatalogBrand, slugify } from "@/lib/catalog-brands-sync";
import { ensureCatalogDefaults } from "@/lib/catalog-seed";
import { getSupabaseClient } from "@/utils/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const catalog = await fetchPhoneCatalog(supabase);
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("[admin/catalog/phones/get]", error);
    return NextResponse.json(
      { ...EMPTY_PHONE_CATALOG, error: "Failed to load phone catalog." },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kind = body.kind as string;
    const supabase = getSupabaseClient();

    function invalidatePhoneCatalog() {
      revalidateTag("catalog-brands");
      revalidateTag("catalog-phones");
    }

    if (kind === "brand") {
      const label = body.label?.toString().trim();
      if (!label) {
        return NextResponse.json({ error: "Etichetta marca obbligatoria." }, { status: 400 });
      }
      await ensureCatalogDefaults(supabase);
      const slug = body.slug?.toString().trim() || slugify(label);
      const item = await addPhoneCatalogBrand(supabase, { slug, label });
      invalidatePhoneCatalog();
      return NextResponse.json({ item });
    }

    if (kind === "model") {
      const brandId = body.brandId?.toString();
      const label = body.label?.toString().trim();
      if (!brandId || !label) {
        return NextResponse.json(
          { error: "Marca e modello obbligatori." },
          { status: 400 }
        );
      }
      const slug = body.slug?.toString().trim() || slugify(label);
      const { data, error } = await supabase
        .from("catalog_phone_models")
        .insert({ brand_id: brandId, slug, label })
        .select("*")
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      invalidatePhoneCatalog();
      return NextResponse.json({ item: data });
    }

    if (kind === "condition") {
      const label = body.label?.toString().trim();
      const shopGroup = body.shopGroup === "used" ? "used" : "new";
      if (!label) {
        return NextResponse.json({ error: "Etichetta condizione obbligatoria." }, { status: 400 });
      }
      const slug = body.slug?.toString().trim() || slugify(label);
      const { data, error } = await supabase
        .from("catalog_phone_conditions")
        .insert({ slug, label, shop_group: shopGroup })
        .select("*")
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      invalidatePhoneCatalog();
      return NextResponse.json({ item: data });
    }

    if (kind === "storage") {
      const label = body.label?.toString().trim();
      if (!label) {
        return NextResponse.json({ error: "Capacità obbligatoria." }, { status: 400 });
      }
      const { data, error } = await supabase
        .from("catalog_phone_storage")
        .insert({ label })
        .select("*")
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ item: data });
    }

    if (kind === "color") {
      const label = body.label?.toString().trim();
      if (!label) {
        return NextResponse.json({ error: "Colore obbligatorio." }, { status: 400 });
      }
      const hexRaw = body.hexColor?.toString().trim() ?? "#64748b";
      const hex_color = /^#[0-9a-fA-F]{6}$/.test(hexRaw)
        ? hexRaw.toLowerCase()
        : "#64748b";
      const { data, error } = await supabase
        .from("catalog_phone_colors")
        .insert({ label, hex_color })
        .select("*")
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      invalidatePhoneCatalog();
      return NextResponse.json({ item: data });
    }

    return NextResponse.json({ error: "Tipo catalogo non valido." }, { status: 400 });
  } catch (error) {
    console.error("[admin/catalog/phones/post]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
