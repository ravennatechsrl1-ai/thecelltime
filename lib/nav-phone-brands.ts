import { NavDropdownGroup } from "@/components/NavDropdown";
import { CatalogBrand } from "@/lib/catalog-brands-sync";
import { Translations } from "@/lib/i18n/types";
import { PHONE_BRANDS, shopBrandHref } from "@/lib/phone-brands";

export function buildPhoneNavGroups(
  t: Translations,
  catalogBrands: CatalogBrand[] = []
): NavDropdownGroup[] {
  const brands =
    catalogBrands.length > 0
      ? catalogBrands.map((brand) => ({ slug: brand.slug, label: brand.label }))
      : PHONE_BRANDS.map((brand) => ({
          slug: brand.slug,
          label: t.nav[brand.labelKey],
        }));

  const brandItems = (filter: "phones-new" | "phones-used") =>
    brands.map((brand) => ({
      href: shopBrandHref(filter, brand.slug),
      label: brand.label,
    }));

  return [
    { label: t.nav.phonesNew, items: brandItems("phones-new") },
    { label: t.nav.phonesUsed, items: brandItems("phones-used") },
  ];
}
