import { unstable_cache } from "next/cache";
import { Locale } from "@/lib/i18n/types";
import { getSupabaseClientSafe } from "@/utils/supabase";

export type PromotionStripTexts = Record<Locale, string>;

export interface PromotionStrip {
  text: PromotionStripTexts;
  enabled: boolean;
}

const EMPTY_TEXTS: PromotionStripTexts = { it: "", en: "" };
const EMPTY_STRIP: PromotionStrip = { text: EMPTY_TEXTS, enabled: false };

function mapTexts(row: Record<string, unknown>): PromotionStripTexts {
  return {
    it: typeof row.text_it === "string" ? row.text_it : "",
    en: typeof row.text_en === "string" ? row.text_en : "",
  };
}

async function loadPromotionStripFromDb(): Promise<PromotionStrip> {
  const supabase = getSupabaseClientSafe();
  if (!supabase) return EMPTY_STRIP;

  const { data, error } = await supabase
    .from("promotion_strip")
    .select("text_it, text_en, enabled")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[promotion-strip/load]", error);
    return EMPTY_STRIP;
  }

  if (!data) return EMPTY_STRIP;

  return {
    text: mapTexts(data as Record<string, unknown>),
    enabled: Boolean(data.enabled),
  };
}

export const getPromotionStripCached = unstable_cache(
  loadPromotionStripFromDb,
  ["promotion-strip-v2"],
  { revalidate: 60, tags: ["promotion-strip"] }
);

export function getPromotionStripText(
  strip: PromotionStrip,
  locale: Locale
): string {
  return strip.text[locale]?.trim() ?? "";
}

export function isPromotionStripVisible(
  strip: PromotionStrip,
  locale: Locale
): boolean {
  return strip.enabled && getPromotionStripText(strip, locale).length > 0;
}
