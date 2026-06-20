"use client";

import SafeImage from "@/components/SafeImage";
import { useLanguage } from "@/components/LanguageProvider";
import { getPhoneColorLabel } from "@/lib/phone-variants";
import { Product } from "@/types";

interface PhoneColorVariantPickerProps {
  variants: Product[];
  activeId: string;
  onSelect: (variant: Product) => void;
  size?: "compact" | "detail";
}

export default function PhoneColorVariantPicker({
  variants,
  activeId,
  onSelect,
  size = "compact",
}: PhoneColorVariantPickerProps) {
  const { t } = useLanguage();

  if (variants.length === 0) return null;

  const isDetail = size === "detail";
  const showSingle = isDetail && variants.length === 1;

  return (
    <div className={isDetail ? "mt-6" : "mt-2.5"}>
      <p
        className={
          isDetail
            ? "mb-3 text-sm font-semibold text-brand-navy"
            : "mb-1.5 text-[10px] font-semibold text-brand-gray-800 sm:text-[11px]"
        }
      >
        {t.shop.colorsLabel}
      </p>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const colorLabel = getPhoneColorLabel(variant) ?? variant.name;
          const isActive = variant.id === activeId;
          const outOfStock = variant.stock <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              title={colorLabel}
              aria-label={colorLabel}
              aria-pressed={isActive}
              disabled={outOfStock && !showSingle}
              onClick={() => onSelect(variant)}
              className={`flex flex-col overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 ${
                isDetail ? "min-w-[100px] max-w-[120px] sm:min-w-[110px]" : "min-w-[72px] max-w-[88px] shrink-0 sm:min-w-[80px]"
              } ${
                isActive
                  ? "border-brand-electric shadow-sm ring-2 ring-brand-electric/20"
                  : "border-brand-gray-200 hover:border-brand-gray-300"
              } ${outOfStock && !showSingle ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <div
                className={`relative w-full bg-[#fafafa] p-2 ${
                  isDetail ? "aspect-square" : "aspect-[4/5]"
                }`}
              >
                <SafeImage
                  src={variant.image_url}
                  alt={colorLabel}
                  fill
                  className="object-contain p-1"
                  sizes={isDetail ? "120px" : "80px"}
                />
              </div>
              <span
                className={`truncate px-2 py-2 text-center leading-tight ${
                  isDetail ? "text-xs sm:text-sm" : "text-[9px] sm:text-[10px]"
                } ${
                  isActive
                    ? "font-semibold text-brand-navy"
                    : "font-medium text-brand-gray-500"
                }`}
              >
                {colorLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
