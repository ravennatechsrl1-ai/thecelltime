import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { buildPhoneProductName } from "@/lib/admin-catalog";
import { buildVariantProductName, buildVariantProductNameI18n } from "@/lib/phone-listings";
import { mapProductRow } from "@/lib/map-product";
import { buildNameI18nFromForm } from "@/lib/product-i18n";
import { uploadProductImage } from "@/lib/upload-product-image";
import { getSupabaseClient } from "@/utils/supabase";
import { Product } from "@/types";

interface VariantPayload {
  storage: string;
  color: string;
  price: number;
  stock: number;
}

function parseVariants(raw: string | null): VariantPayload[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const variants: VariantPayload[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const storage = String(row.storage ?? "").trim();
      const color = String(row.color ?? "").trim();
      const price = Number(row.price);
      const stock = Number(row.stock);

      if (!storage || !color || Number.isNaN(price) || price < 0) return null;
      if (Number.isNaN(stock) || stock < 0) return null;

      variants.push({ storage, color, price, stock });
    }

    const keys = new Set(
      variants.map((v) => `${v.storage.toLowerCase()}|${v.color.toLowerCase()}`)
    );
    if (keys.size !== variants.length) return null;

    return variants;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const brand = formData.get("brand")?.toString().trim();
    const phoneModel = formData.get("phone_model")?.toString().trim();
    const condition = formData.get("condition")?.toString().trim();
    const variants = parseVariants(formData.get("variants")?.toString() ?? null);

    if (!brand || !phoneModel || !condition || !variants) {
      return NextResponse.json(
        { error: "Dati prodotto o varianti non validi." },
        { status: 400 }
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const image = formData.get(`image_${i}`);
      if (!(image instanceof File) || image.size === 0) {
        return NextResponse.json(
          { error: `Immagine obbligatoria per la variante ${i + 1}.` },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseClient();
    const baseName = buildPhoneProductName(brand, phoneModel, "", "");
    const nameEn = formData.get("name_en")?.toString();
    const baseNameI18n = buildNameI18nFromForm(baseName, nameEn);

    const { data: listing, error: listingError } = await supabase
      .from("phone_listings")
      .insert({
        brand,
        phone_model: phoneModel,
        condition,
        base_name: baseName,
        base_name_i18n: baseNameI18n,
      })
      .select("*")
      .single();

    if (listingError || !listing) {
      console.error("[admin/phone-listings/insert]", listingError);
      return NextResponse.json(
        { error: "Errore durante la creazione del prodotto." },
        { status: 500 }
      );
    }

    const createdProducts: Product[] = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const imageFile = formData.get(`image_${i}`) as File;
      const imageUrl = await uploadProductImage(supabase, imageFile);
      const nameI18n = buildVariantProductNameI18n(
        {
          brand,
          phone_model: phoneModel,
          base_name: baseName,
          base_name_i18n: baseNameI18n,
        },
        variant.storage,
        variant.color
      );
      const name = nameI18n.it ?? buildVariantProductName(
        {
          brand,
          phone_model: phoneModel,
          base_name: baseName,
        },
        variant.storage,
        variant.color
      );

      const { data, error: insertError } = await supabase
        .from("products")
        .insert({
          name,
          name_i18n: nameI18n,
          brand,
          category: "phones",
          condition,
          price: variant.price,
          stock: variant.stock,
          image_url: imageUrl,
          storage: variant.storage,
          color: variant.color,
          phone_listing_id: listing.id,
        })
        .select("*")
        .single();

      if (insertError || !data) {
        console.error("[admin/phone-listings/variant]", insertError);
        return NextResponse.json(
          { error: "Errore durante il salvataggio di una variante." },
          { status: 500 }
        );
      }

      createdProducts.push(
        mapProductRow({
          ...(data as Record<string, unknown>),
          phone_listings: { base_name: baseName, base_name_i18n: baseNameI18n },
        })
      );
    }

    revalidateTag("products");

    return NextResponse.json({
      listing: {
        id: listing.id as string,
        brand,
        phone_model: phoneModel,
        condition,
        base_name: baseName,
      },
      products: createdProducts,
    });
  } catch (error) {
    console.error("[admin/phone-listings]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
