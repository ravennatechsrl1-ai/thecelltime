import { NextRequest, NextResponse } from "next/server";
import {
  DATA_RESET_CONFIRM_PHRASE,
  resetShopDataExceptCatalog,
} from "@/lib/admin-data-reset";
import { getSupabaseAdminClientSafe } from "@/utils/supabase";

export async function POST(request: NextRequest) {
  try {
    const body: { password?: string; confirmPhrase?: string } =
      await request.json();
    const password = body.password?.trim();
    const confirmPhrase = body.confirmPhrase?.trim();

    if (!password || !confirmPhrase) {
      return NextResponse.json(
        { error: "Password and confirmation phrase are required." },
        { status: 400 }
      );
    }

    if (confirmPhrase !== DATA_RESET_CONFIRM_PHRASE) {
      return NextResponse.json(
        { error: "Confirmation phrase does not match." },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password is not configured." },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdminClientSafe();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database unavailable." },
        { status: 500 }
      );
    }

    const result = await resetShopDataExceptCatalog(supabase);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[admin/data-reset]", error);
    const message =
      error instanceof Error ? error.message : "Data reset failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
