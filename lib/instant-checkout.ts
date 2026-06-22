import { CheckoutRequestBody } from "@/types";

const STORAGE_KEY = "thecelltime-instant-checkout";

export function saveInstantCheckout(payload: CheckoutRequestBody): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readInstantCheckout(): CheckoutRequestBody | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutRequestBody;
  } catch {
    return null;
  }
}

export function clearInstantCheckout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
