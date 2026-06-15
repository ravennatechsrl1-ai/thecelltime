import { Product } from "@/types";

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function getConditionLabel(condition: Product["condition"]): string | null {
  if (condition === "new") return "Nuovo";
  if (condition === "used") return "Usato Grado A";
  return null;
}

export function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const REPAIR_STATUSES = [
  "Ricevuto",
  "In Diagnostica",
  "In Riparazione",
  "Pronto al Ritiro",
] as const;

export const DEVICE_OPTIONS = [
  {
    brand: "Apple",
    models: [
      "iPhone 15 Pro Max",
      "iPhone 15 Pro",
      "iPhone 15",
      "iPhone 14 Pro",
      "iPhone 14",
      "iPhone 13",
      "iPhone SE (2022)",
    ],
  },
  {
    brand: "Samsung",
    models: [
      "Galaxy S24 Ultra",
      "Galaxy S24+",
      "Galaxy S24",
      "Galaxy S23 Ultra",
      "Galaxy S23",
      "Galaxy A54",
      "Galaxy Z Fold5",
    ],
  },
] as const;

export const REPAIR_ISSUES = [
  { id: "screen" as const, basePrice: 89 },
  { id: "battery" as const, basePrice: 59 },
  { id: "charging" as const, basePrice: 49 },
];

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
