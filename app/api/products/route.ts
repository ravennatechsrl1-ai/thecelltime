import { NextResponse } from "next/server";
import { getProductsCached } from "@/lib/server/products";

export const revalidate = 60;

export async function GET() {
  try {
    const products = await getProductsCached();
    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[products]", error);
    return NextResponse.json({ products: [] });
  }
}
