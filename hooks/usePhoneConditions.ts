"use client";

import { useEffect, useMemo, useState } from "react";
import {
  normalizePhoneCatalog,
  PhoneConditionOption,
} from "@/lib/catalog-service";
import { buildPhoneConditionIndex } from "@/lib/phone-conditions";

let cachedConditions: PhoneConditionOption[] | null = null;
let loadPromise: Promise<PhoneConditionOption[]> | null = null;

async function fetchPhoneConditions(): Promise<PhoneConditionOption[]> {
  if (cachedConditions) return cachedConditions;

  if (!loadPromise) {
    loadPromise = fetch("/api/catalog/phones")
      .then((response) => response.json())
      .then((data) => {
        const conditions = normalizePhoneCatalog(data).conditions;
        cachedConditions = conditions;
        return conditions;
      })
      .catch(() => [] as PhoneConditionOption[]);
  }

  return loadPromise;
}

export function usePhoneConditions() {
  const [conditions, setConditions] = useState<PhoneConditionOption[]>(
    cachedConditions ?? []
  );

  useEffect(() => {
    void fetchPhoneConditions().then(setConditions);
  }, []);

  const index = useMemo(
    () => buildPhoneConditionIndex(conditions),
    [conditions]
  );

  return { conditions, index };
}
