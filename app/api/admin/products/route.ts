import { NextRequest, NextResponse } from "next/server";
import { fetchAllProducts } from "@/lib/admin-analytics";
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
    if (conditionRaw === "new" || conditionRaw === "used") {
      condition = conditionRaw;
    }

    const supabase = getSupabaseClient();

    const fileExt = imageFile.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const arrayBuffer = await imageFile.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, fileBuffer, {
        contentType: imageFile.type,
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

    const { data, error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        brand,
        category,
        condition,
        price,
        stock,
        image_url: imageUrl,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[admin/products/insert]", insertError);
      return NextResponse.json(
        { error: "Errore durante il salvataggio del prodotto." },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: mapProductRow(data as Record<string, unknown>) });
  } catch (error) {
    console.error("[admin/products]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
