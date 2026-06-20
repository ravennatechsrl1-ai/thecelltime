"use client";

import { useEffect, useMemo, useState } from "react";
import {
  normalizePhoneCatalog,
  PhoneColorOption,
} from "@/lib/catalog-service";

let cachedColors: PhoneColorOption[] | null = null;
let loadPromise: Promise<PhoneColorOption[]> | null = null;

async function fetchPhoneColors(): Promise<PhoneColorOption[]> {
  if (cachedColors) return cachedColors;

  if (!loadPromise) {
    loadPromise = fetch("/api/catalog/phones")
      .then((response) => response.json())
      .then((data) => {
        const colors = normalizePhoneCatalog(data).colors;
        cachedColors = colors;
        return colors;
      })
      .catch(() => [] as PhoneColorOption[]);
  }

  return loadPromise;
}

export function usePhoneColors() {
  const [colors, setColors] = useState<PhoneColorOption[]>(cachedColors ?? []);

  useEffect(() => {
    void fetchPhoneColors().then(setColors);
  }, []);

  const hexByLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const color of colors) {
      map.set(color.label.trim().toLowerCase(), color.hex_color);
    }
    return map;
  }, [colors]);

  return { colors, hexByLabel };
}
