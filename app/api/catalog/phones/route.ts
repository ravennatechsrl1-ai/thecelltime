import { NextResponse } from "next/server";
import { EMPTY_PHONE_CATALOG } from "@/lib/catalog-service";
import { getPhoneCatalogCached } from "@/lib/server/catalog";

export const revalidate = 300;

export async function GET() {
  try {
    const catalog = await getPhoneCatalogCached();
    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[catalog/phones/get]", error);
    return NextResponse.json(EMPTY_PHONE_CATALOG, { status: 200 });
  }
}
