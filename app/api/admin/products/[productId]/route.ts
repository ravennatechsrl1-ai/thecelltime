import { NextRequest, NextResponse } from "next/server";
import { mapProductRow } from "@/lib/map-product";
import { getSupabaseClient } from "@/utils/supabase";
import { ProductCondition } from "@/types";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

function extractStorageFileName(imageUrl: string): string | null {
  const marker = "/product-images/";
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return imageUrl.slice(index + marker.length).split("?")[0] || null;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { productId } = await params;
    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim();
    const brand = formData.get("brand")?.toString().trim();
    const priceRaw = formData.get("price")?.toString();
    const stockRaw = formData.get("stock")?.toString();
    const conditionRaw = formData.get("condition")?.toString();
    const imageFile = formData.get("image");

    if (!name || !brand || !priceRaw || !stockRaw) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti." },
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

    const { data: existing, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Prodotto non trovato." },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      name,
      brand,
      price,
      stock,
      condition: existing.category === "phones" ? condition : null,
    };

    if (imageFile instanceof File && imageFile.size > 0) {
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
        console.error("[admin/products/patch/upload]", uploadError);
        return NextResponse.json(
          { error: "Errore durante il caricamento dell'immagine." },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      updates.image_url = publicUrlData.publicUrl;

      const oldFileName = extractStorageFileName(existing.image_url as string);
      if (oldFileName) {
        await supabase.storage.from("product-images").remove([oldFileName]);
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[admin/products/patch]", error);
      return NextResponse.json(
        { error: "Aggiornamento prodotto fallito." },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: mapProductRow(data) });
  } catch (error) {
    console.error("[admin/products/patch]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { productId } = await params;
    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", productId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Prodotto non trovato." },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("[admin/products/delete]", error);
      return NextResponse.json(
        { error: "Eliminazione prodotto fallita." },
        { status: 500 }
      );
    }

    const fileName = extractStorageFileName(existing.image_url as string);
    if (fileName) {
      await supabase.storage.from("product-images").remove([fileName]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/products/delete]", error);
    const message =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
