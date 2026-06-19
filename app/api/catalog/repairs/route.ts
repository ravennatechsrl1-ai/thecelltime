import { NextResponse } from "next/server";
import { getRepairTypesCached } from "@/lib/server/repair-catalog";

export const revalidate = 300;

export async function GET() {
  try {
    const types = await getRepairTypesCached();
    return NextResponse.json(
      { types },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[catalog/repairs/get]", error);
    return NextResponse.json({ types: [] }, { status: 200 });
  }
}
