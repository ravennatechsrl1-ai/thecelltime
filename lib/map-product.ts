import { Product, ProductCategory, ProductCondition } from "@/types";

export function mapProductRow(row: Record<string, unknown>): Product {
  const promotionRaw = row.promotion_percent;
  const promotion_percent =
    promotionRaw == null || promotionRaw === ""
      ? null
      : Number(promotionRaw);

  return {
    id: row.id as string,
    name: row.name as string,
    price: Number(row.price),
    category: row.category as ProductCategory,
    condition: row.condition as ProductCondition,
    brand: row.brand as string,
    image_url: row.image_url as string,
    stock: Number(row.stock),
    promotion_percent:
      promotion_percent != null &&
      !Number.isNaN(promotion_percent) &&
      promotion_percent > 0
        ? promotion_percent
        : null,
  };
}
