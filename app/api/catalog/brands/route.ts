import { NextResponse } from "next/server";
import { getCatalogBrandsCached } from "@/lib/server/catalog";

export const revalidate = 300;

export async function GET() {
  try {
    const brands = await getCatalogBrandsCached();
    return NextResponse.json(
      { brands },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[catalog/brands/get]", error);
    return NextResponse.json({ brands: [] }, { status: 200 });
  }
}
