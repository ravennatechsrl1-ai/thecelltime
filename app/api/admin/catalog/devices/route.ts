import { NextRequest, NextResponse } from "next/server";
import {
  fetchDeviceCatalog,
  EMPTY_DEVICE_CATALOG,
} from "@/lib/catalog-service";
import { ensureBrandsSynced, syncBrandGlobally, slugify } from "@/lib/catalog-brands-sync";
import { ensureCatalogDefaults } from "@/lib/catalog-seed";
import {
  isProtectionDeviceType,
  ProtectionDeviceType,
} from "@/lib/protection-catalog";
import { getSupabaseClient } from "@/utils/supabase";

export async function GET(request: NextRequest) {
  try {
    const deviceType = request.nextUrl.searchParams.get("deviceType");
    if (!deviceType || !isProtectionDeviceType(deviceType)) {
      return NextResponse.json(
        { error: "deviceType non valido." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const tree = await fetchDeviceCatalog(
      supabase,
      deviceType as ProtectionDeviceType
    );
    return NextResponse.json(tree);
  } catch (error) {
    console.error("[admin/catalog/devices/get]", error);
    return NextResponse.json(EMPTY_DEVICE_CATALOG, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kind = body.kind as string;
    const supabase = getSupabaseClient();

    if (kind === "brand") {
      const deviceType = body.deviceType?.toString();
      const label = body.label?.toString().trim();
      if (!deviceType || !isProtectionDeviceType(deviceType) || !label) {
        return NextResponse.json(
          { error: "Tipo dispositivo e marca obbligatori." },
          { status: 400 }
        );
      }
      await ensureCatalogDefaults(supabase);
      const slug = body.slug?.toString().trim() || slugify(label);
      await syncBrandGlobally(supabase, { slug, label });
      const { data, error } = await supabase
        .from("catalog_device_brands")
        .select("*")
        .eq("device_type", deviceType)
        .eq("slug", slug)
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ item: data });
    }

    if (kind === "series") {
      const brandId = body.brandId?.toString();
      const label = body.label?.toString().trim();
      if (!brandId || !label) {
        return NextResponse.json(
          { error: "Marca e serie obbligatori." },
          { status: 400 }
        );
      }
      const slug = body.slug?.toString().trim() || slugify(label);
      const { data, error } = await supabase
        .from("catalog_device_series")
        .insert({ brand_id: brandId, slug, label })
        .select("*")
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ item: data });
    }

    if (kind === "model") {
      const seriesId = body.seriesId?.toString();
      const label = body.label?.toString().trim();
      if (!seriesId || !label) {
        return NextResponse.json(
          { error: "Serie e modello obbligatori." },
          { status: 400 }
        );
      }
      const slug = body.slug?.toString().trim() || slugify(label);
      const isRecent = Boolean(body.isRecent);
      const { data, error } = await supabase
        .from("catalog_device_models")
        .insert({ series_id: seriesId, slug, label, is_recent: isRecent })
        .select("*")
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ item: data });
    }

    return NextResponse.json({ error: "Tipo catalogo non valido." }, { status: 400 });
  } catch (error) {
    console.error("[admin/catalog/devices/post]", error);
    return NextResponse.json({ error: "Errore interno." }, { status: 500 });
  }
}
