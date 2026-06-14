import { NavDropdownGroup } from "@/components/NavDropdown";
import { Translations } from "@/lib/i18n/types";
import { PHONE_BRANDS, shopBrandHref } from "@/lib/phone-brands";

export function buildPhoneNavGroups(t: Translations): NavDropdownGroup[] {
  const brandItems = (filter: "phones-new" | "phones-used") =>
    PHONE_BRANDS.map((brand) => ({
      href: shopBrandHref(filter, brand.slug),
      label: t.nav[brand.labelKey],
    }));

  return [
    { label: t.nav.phonesNew, items: brandItems("phones-new") },
    { label: t.nav.phonesUsed, items: brandItems("phones-used") },
  ];
}
