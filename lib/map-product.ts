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
    protection_device_type: (row.protection_device_type as string) ?? null,
    protection_brand_slug: (row.protection_brand_slug as string) ?? null,
    protection_model_slug: (row.protection_model_slug as string) ?? null,
    protection_series: (row.protection_series as string) ?? null,
    protection_subtype: (row.protection_subtype as string) ?? null,
    accessory_device_type: (row.accessory_device_type as string) ?? null,
    accessory_brand_slug: (row.accessory_brand_slug as string) ?? null,
    accessory_model_slug: (row.accessory_model_slug as string) ?? null,
    accessory_series: (row.accessory_series as string) ?? null,
    accessory_subtype: (row.accessory_subtype as string) ?? null,
  };
}
