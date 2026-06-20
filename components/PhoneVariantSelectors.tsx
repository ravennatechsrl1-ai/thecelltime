"use client";

import { useEffect, useMemo, useState } from "react";
import PhoneColorVariantPicker from "@/components/PhoneColorVariantPicker";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getColorPickerVariants,
  getColorsForStorage,
  getUniqueStorages,
} from "@/lib/phone-listings";
import { getPhoneColorLabel, getPhoneStorageLabel } from "@/lib/phone-variants";
import { Product } from "@/types";

interface PhoneVariantSelectorsProps {
  variants: Product[];
  selected: Product;
  onSelect: (variant: Product) => void;
}

export default function PhoneVariantSelectors({
  variants,
  selected,
  onSelect,
}: PhoneVariantSelectorsProps) {
  const { t } = useLanguage();
  const storages = useMemo(() => getUniqueStorages(variants), [variants]);

  const initialStorage =
    getPhoneStorageLabel(selected) ?? storages[0] ?? "";

  const [activeStorage, setActiveStorage] = useState(initialStorage);

  useEffect(() => {
    const storage = getPhoneStorageLabel(selected);
    if (storage) setActiveStorage(storage);
  }, [selected]);

  const colorsForPicker = useMemo(
    () => getColorPickerVariants(variants, activeStorage),
    [variants, activeStorage]
  );

  function handleStorageSelect(storage: string) {
    setActiveStorage(storage);
    const colors = getColorsForStorage(variants, storage);
    const inStock = colors.find((v) => v.stock > 0);
    const next = inStock ?? colors[0];
    if (next) onSelect(next);
  }

  if (variants.length <= 1) {
    const storage = getPhoneStorageLabel(selected);
    const color = getPhoneColorLabel(selected);
    if (!storage && !color) return null;
    return (
      <div className="mt-6 space-y-2 text-sm text-brand-gray-600">
        {storage && (
          <p>
            <span className="font-semibold text-brand-navy">{t.shop.storageLabel}:</span>{" "}
            {storage}
          </p>
        )}
        {color && (
          <p>
            <span className="font-semibold text-brand-navy">{t.shop.colorsLabel}:</span>{" "}
            {color}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {storages.length >= 1 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-brand-navy">
            {t.shop.storageLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage) => {
              const isActive = activeStorage === storage;
              const hasStock = getColorsForStorage(variants, storage).some(
                (v) => v.stock > 0
              );

              return (
                <button
                  key={storage}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleStorageSelect(storage)}
                  className={`min-h-[40px] border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-brand-electric bg-brand-electric/5 text-brand-navy"
                      : "border-brand-gray-200 text-brand-gray-600 hover:border-brand-gray-300"
                  } ${!hasStock ? "opacity-60" : ""}`}
                >
                  {storage}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <PhoneColorVariantPicker
        variants={colorsForPicker}
        activeId={selected.id}
        onSelect={(variant) => {
          const storage = getPhoneStorageLabel(variant);
          if (storage) setActiveStorage(storage);
          onSelect(variant);
        }}
        size="detail"
      />
    </div>
  );
}
