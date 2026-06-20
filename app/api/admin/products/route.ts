import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { fetchAllProducts } from "@/lib/admin-analytics";
import { isAccessorySubtype } from "@/lib/accessories-catalog";
import { isProtectionSubtype } from "@/lib/protection-catalog";
import { mapProductRow } from "@/lib/map-product";
import { getSupabaseClient } from "@/utils/supabase";
import { ProductCategory, ProductCondition } from "@/types";

export async function GET() {
  try {
    const products = await fetchAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[admin/products/list]", error);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim();
    const brand = formData.get("brand")?.toString().trim();
    const category = formData.get("category")?.toString() as ProductCategory;
    const conditionRaw = formData.get("condition")?.toString();
    const priceRaw = formData.get("price")?.toString();
    const stockRaw = formData.get("stock")?.toString();
    const imageFile = formData.get("image");

    if (!name || !brand || !category || !priceRaw || !stockRaw) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti." },
        { status: 400 }
      );
    }

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return NextResponse.json(
        { error: "Immagine prodotto obbligatoria." },
        { status: 400 }
      );
    }

    const price = parseFloat(priceRaw);
    const stock = parseInt(stockRaw, 10);

    if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Prezzo o stock non validi." },
        { status: 400 }
      );
    }

    let condition: ProductCondition = null;
    let phoneStorage: string | null = null;
    let phoneColor: string | null = null;
    if (category === "phones") {
      const slug = conditionRaw?.trim();
      if (!slug) {
        return NextResponse.json(
          { error: "Condizione obbligatoria per i telefoni." },
          { status: 400 }
        );
      }
      condition = slug;

      phoneStorage = formData.get("storage")?.toString().trim() ?? null;
      phoneColor = formData.get("color")?.toString().trim() ?? null;
      if (!phoneStorage) {
        return NextResponse.json(
          { error: "Capacità obbligatoria per i telefoni." },
          { status: 400 }
        );
      }
      if (!phoneColor) {
        return NextResponse.json(
          { error: "Colore obbligatorio per i telefoni." },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseClient();

    const fileExt = (imageFile.name.split(".").pop() ?? "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const safeExt = fileExt || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

    const arrayBuffer = await imageFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const contentType =
      imageFile.type ||
      (safeExt === "png"
        ? "image/png"
        : safeExt === "webp"
          ? "image/webp"
          : "image/jpeg");

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[admin/products/upload]", uploadError);
      return NextResponse.json(
        { error: "Errore durante il caricamento dell'immagine." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    const insertRow: Record<string, unknown> = {
      name,
      brand,
      category,
      condition: category === "phones" ? condition : null,
      price,
      stock,
      image_url: imageUrl,
    };

    if (category === "phones" && phoneStorage && phoneColor) {
      insertRow.storage = phoneStorage;
      insertRow.color = phoneColor;
    }

    if (category === "protection") {
      const protectionDeviceType = formData
        .get("protection_device_type")
        ?.toString();
      const protectionBrandSlug = formData
        .get("protection_brand_slug")
        ?.toString();
      const protectionModelSlug = formData
        .get("protection_model_slug")
        ?.toString();
      const protectionSeries = formData.get("protection_series")?.toString();
      const protectionSubtype = formData.get("protection_subtype")?.toString();

      if (
        !protectionDeviceType ||
        !protectionBrandSlug ||
        !protectionModelSlug ||
        !protectionSubtype ||
        !isProtectionSubtype(protectionSubtype)
      ) {
        return NextResponse.json(
          { error: "Dati protezione mancanti o non validi." },
          { status: 400 }
        );
      }

      insertRow.protection_device_type = protectionDeviceType;
      insertRow.protection_brand_slug = protectionBrandSlug;
      insertRow.protection_model_slug = protectionModelSlug;
      insertRow.protection_series = protectionSeries ?? null;
      insertRow.protection_subtype = protectionSubtype;
    }

    if (category === "accessories") {
      const accessoryDeviceType = formData
        .get("accessory_device_type")
        ?.toString();
      const accessoryBrandSlug = formData
        .get("accessory_brand_slug")
        ?.toString();
      const accessoryModelSlug = formData
        .get("accessory_model_slug")
        ?.toString();
      const accessorySeries = formData.get("accessory_series")?.toString();
      const accessorySubtype = formData.get("accessory_subtype")?.toString();

      if (
        accessoryDeviceType ||
        accessoryBrandSlug ||
        accessoryModelSlug ||
        accessorySubtype
      ) {
        if (
          !accessoryDeviceType ||
          !accessoryBrandSlug ||
          !accessoryModelSlug ||
          !accessorySubtype ||
          !isAccessorySubtype(accessorySubtype)
        ) {
          return NextResponse.json(
            { error: "Dati accessori mancanti o non validi." },
            { status: 400 }
          );
        }

        insertRow.accessory_device_type = accessoryDeviceType;
        insertRow.accessory_brand_slug = accessoryBrandSlug;
        insertRow.accessory_model_slug = accessoryModelSlug;
        insertRow.accessory_series = accessorySeries ?? null;
        insertRow.accessory_subtype = accessorySubtype;
      }
    }

    const { data, error: insertError } = await supabase
      .from("products")
      .insert(insertRow)
      .select("*")
      .single();

    if (insertError) {
      console.error("[admin/products/insert]", insertError);
      return NextResponse.json(
        { error: "Errore durante il salvataggio del prodotto." },
        { status: 500 }
      );
    }

    revalidateTag("products");

    return NextResponse.json({ product: mapProductRow(data as Record<string, unknown>) });
  } catch (error) {
    console.error("[admin/products]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
