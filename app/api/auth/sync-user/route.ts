import { NextResponse } from "next/server";
import { syncShopUser } from "@/lib/sync-shop-user";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;
    const address =
      typeof user.user_metadata?.address === "string"
        ? user.user_metadata.address
        : null;
    const phone =
      typeof user.user_metadata?.phone === "string"
        ? user.user_metadata.phone
        : null;

    await syncShopUser(supabase, user.id, user.email, fullName, address, phone);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[auth/sync-user]", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
