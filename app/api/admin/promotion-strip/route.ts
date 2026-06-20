import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Locale } from "@/lib/i18n/types";
import { PromotionStrip, PromotionStripTexts } from "@/lib/promotion-strip";
import { getSupabaseClient } from "@/utils/supabase";

function mapRow(row: Record<string, unknown>): PromotionStrip {
  return {
    text: {
      it: typeof row.text_it === "string" ? row.text_it : "",
      en: typeof row.text_en === "string" ? row.text_en : "",
    },
    enabled: Boolean(row.enabled),
  };
}

function parseTexts(value: unknown): PromotionStripTexts | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const text: Partial<PromotionStripTexts> = {};

  for (const locale of ["it", "en"] as const) {
    if (!(locale in record)) continue;
    if (typeof record[locale] !== "string") return null;
    text[locale] = record[locale].trim();
  }

  if (Object.keys(text).length === 0) return null;

  return {
    it: text.it ?? "",
    en: text.en ?? "",
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("promotion_strip")
      .select("text_it, text_en, enabled")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[admin/promotion-strip/GET]", error);
      return NextResponse.json(
        { error: "Could not load promotion strip." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      strip: data
        ? mapRow(data as Record<string, unknown>)
        : { text: { it: "", en: "" }, enabled: false },
    });
  } catch (error) {
    console.error("[admin/promotion-strip/GET]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const record = body as {
      text?: unknown;
      enabled?: unknown;
      text_it?: unknown;
      text_en?: unknown;
    };
    const patch: Record<string, string | boolean> = {};

    if ("text" in record) {
      const parsed = parseTexts(record.text);
      if (!parsed) {
        return NextResponse.json(
          { error: "text must be an object with it and en strings." },
          { status: 400 }
        );
      }
      patch.text_it = parsed.it;
      patch.text_en = parsed.en;
    } else {
      for (const locale of ["it", "en"] as const satisfies Locale[]) {
        const key = `text_${locale}` as const;
        if (!(key in record)) continue;
        if (typeof record[key] !== "string") {
          return NextResponse.json(
            { error: `${key} must be a string.` },
            { status: 400 }
          );
        }
        patch[key] = record[key].trim();
      }
    }

    if ("enabled" in record) {
      if (typeof record.enabled !== "boolean") {
        return NextResponse.json({ error: "enabled must be a boolean." }, { status: 400 });
      }
      patch.enabled = record.enabled;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("promotion_strip")
      .update(patch)
      .eq("id", 1)
      .select("text_it, text_en, enabled")
      .single();

    if (error || !data) {
      console.error("[admin/promotion-strip/PATCH]", error);
      return NextResponse.json(
        { error: "Could not update promotion strip." },
        { status: 500 }
      );
    }

    revalidateTag("promotion-strip");

    return NextResponse.json({ strip: mapRow(data as Record<string, unknown>) });
  } catch (error) {
    console.error("[admin/promotion-strip/PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
