import { SupabaseClient } from "@supabase/supabase-js";

export async function syncShopUser(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  fullName?: string | null,
  address?: string | null,
  phone?: string | null
) {
  const { data: existing } = await supabase
    .from("shop_users")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("shop_users")
      .update({
        email,
        full_name: fullName?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
      })
      .eq("auth_user_id", userId);
    return;
  }

  const { data: byEmail } = await supabase
    .from("shop_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (byEmail) {
    await supabase
      .from("shop_users")
      .update({
        auth_user_id: userId,
        full_name: fullName?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
      })
      .eq("email", email);
    return;
  }

  await supabase.from("shop_users").insert({
    auth_user_id: userId,
    email,
    full_name: fullName?.trim() || null,
    address: address?.trim() || null,
    phone: phone?.trim() || null,
  });
}
