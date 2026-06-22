import { mapProductRow } from "@/lib/map-product";
import { calculatePromoPrice } from "@/lib/product-pricing";
import { CheckoutLineItem } from "@/types";
import { getSupabaseClientSafe } from "@/utils/supabase";

function effectivePriceFromRow(row: Record<string, unknown>): number {
  const price = Number(row.price);
  const promotionRaw = row.promotion_percent;
  const promotion =
    promotionRaw == null || promotionRaw === ""
      ? null
      : Number(promotionRaw);

  if (
    promotion != null &&
    !Number.isNaN(promotion) &&
    promotion > 0 &&
    promotion <= 100
  ) {
    return calculatePromoPrice(price, promotion);
  }
  return price;
}

export async function validateCheckoutLineItems(
  lineItems: CheckoutLineItem[]
): Promise<{ lineItems: CheckoutLineItem[]; totalAmount: number }> {
  if (!lineItems.length) {
    throw new Error("Cart is empty.");
  }

  const supabase = getSupabaseClientSafe();
  if (!supabase) {
    throw new Error("Database unavailable.");
  }

  const validated: CheckoutLineItem[] = [];
  let totalAmount = 0;

  for (const item of lineItems) {
    if (!item.productId || item.quantity <= 0) {
      throw new Error("Invalid cart item.");
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", item.productId)
      .maybeSingle();

    if (error || !data) {
      throw new Error("Product not found.");
    }

    const product = mapProductRow(data as Record<string, unknown>);
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}.`);
    }

    const unitPrice = effectivePriceFromRow(data as Record<string, unknown>);
    validated.push({
      productId: item.productId,
      name: item.name?.trim() || product.name,
      price: unitPrice,
      quantity: item.quantity,
      imageUrl: item.imageUrl ?? product.image_url,
    });
    totalAmount += unitPrice * item.quantity;
  }

  totalAmount = Math.round(totalAmount * 100) / 100;
  return { lineItems: validated, totalAmount };
}
