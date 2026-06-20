import { PhoneConditionOption } from "@/lib/catalog-service";
import { Product } from "@/types";

export type ConditionShopGroup = "new" | "used";

export function buildPhoneConditionIndex(
  conditions: PhoneConditionOption[]
): Map<string, PhoneConditionOption> {
  return new Map(conditions.map((condition) => [condition.slug, condition]));
}

export function resolveConditionShopGroup(
  conditionSlug: string | null | undefined,
  index: Map<string, PhoneConditionOption>
): ConditionShopGroup | null {
  if (!conditionSlug) return null;

  const fromCatalog = index.get(conditionSlug);
  if (fromCatalog) return fromCatalog.shop_group;

  if (conditionSlug === "new") return "new";
  if (conditionSlug === "used") return "used";

  return null;
}

export function productMatchesPhoneShopGroup(
  product: Product,
  group: ConditionShopGroup,
  index: Map<string, PhoneConditionOption>
): boolean {
  if (product.category !== "phones") return false;
  return resolveConditionShopGroup(product.condition, index) === group;
}

export function getPhoneConditionLabel(
  conditionSlug: string | null | undefined,
  index: Map<string, PhoneConditionOption>
): string | null {
  if (!conditionSlug) return null;

  const fromCatalog = index.get(conditionSlug);
  if (fromCatalog) return fromCatalog.label;

  if (conditionSlug === "new") return "New";
  if (conditionSlug === "used") return "Used";

  return conditionSlug;
}

export function getPhoneConditionBadge(
  conditionSlug: string | null | undefined,
  index: Map<string, PhoneConditionOption>
): { text: string; variant: ConditionShopGroup } | null {
  const group = resolveConditionShopGroup(conditionSlug, index);
  if (!group) return null;

  const label = getPhoneConditionLabel(conditionSlug, index);

  if (group === "new") {
    return { text: "NEW", variant: "new" };
  }

  return { text: label ?? "USED", variant: "used" };
}
