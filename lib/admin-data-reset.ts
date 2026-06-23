import type { SupabaseClient } from "@supabase/supabase-js";

export const DATA_RESET_CONFIRM_PHRASE = "DELETE ALL DATA";

export interface DataResetResult {
  orders: number;
  orderItems: number;
  products: number;
  phoneListings: number;
  repairTickets: number;
  shopUsers: number;
  productImages: number;
  promotionStripReset: boolean;
}

async function deleteAllRows(
  supabase: SupabaseClient,
  table: string
): Promise<number> {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    throw new Error(`Failed to clear ${table}: ${error.message}`);
  }

  return count ?? 0;
}

async function clearProductImagesBucket(
  supabase: SupabaseClient
): Promise<number> {
  let removed = 0;

  async function removeFolder(prefix: string): Promise<void> {
    const { data, error } = await supabase.storage
      .from("product-images")
      .list(prefix, { limit: 1000 });

    if (error || !data?.length) return;

    const filePaths: string[] = [];

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        await removeFolder(itemPath);
      } else {
        filePaths.push(itemPath);
      }
    }

    if (filePaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("product-images")
        .remove(filePaths);
      if (removeError) {
        throw new Error(`Failed to remove product images: ${removeError.message}`);
      }
      removed += filePaths.length;
    }
  }

  await removeFolder("");
  return removed;
}

async function resetPromotionStrip(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase
    .from("promotion_strip")
    .update({
      text_it: "",
      text_en: "",
      enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    throw new Error(`Failed to reset promotion strip: ${error.message}`);
  }
}

/**
 * Deletes all operational shop data while preserving catalog option tables
 * (brands, models, conditions, storage, colors, device hierarchy, repair types).
 */
export async function resetShopDataExceptCatalog(
  supabase: SupabaseClient
): Promise<DataResetResult> {
  const orderItems = await deleteAllRows(supabase, "shop_order_items");
  const orders = await deleteAllRows(supabase, "shop_orders");
  const products = await deleteAllRows(supabase, "products");
  const phoneListings = await deleteAllRows(supabase, "phone_listings");
  const repairTickets = await deleteAllRows(supabase, "repair_tickets");
  const shopUsers = await deleteAllRows(supabase, "shop_users");
  const productImages = await clearProductImagesBucket(supabase);
  await resetPromotionStrip(supabase);

  return {
    orders,
    orderItems,
    products,
    phoneListings,
    repairTickets,
    shopUsers,
    productImages,
    promotionStripReset: true,
  };
}
