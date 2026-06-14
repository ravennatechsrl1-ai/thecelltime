import { Product } from "@/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "iphone-15-pro",
    name: "Apple iPhone 15 Pro 128GB",
    price: 1199,
    category: "phones",
    condition: "new",
    brand: "Apple",
    image_url:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
    stock: 12,
  },
  {
    id: "iphone-14",
    name: "Apple iPhone 14 256GB",
    price: 899,
    category: "phones",
    condition: "new",
    brand: "Apple",
    image_url:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop",
    stock: 8,
  },
  {
    id: "samsung-s24-ultra",
    name: "Samsung Galaxy S24 Ultra 512GB",
    price: 1399,
    category: "phones",
    condition: "new",
    brand: "Samsung",
    image_url:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop",
    stock: 6,
  },
  {
    id: "samsung-s23-refurb",
    name: "Samsung Galaxy S23 256GB",
    price: 549,
    category: "phones",
    condition: "used",
    brand: "Samsung",
    image_url:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
    stock: 15,
  },
  {
    id: "iphone-13-refurb",
    name: "Apple iPhone 13 128GB",
    price: 479,
    category: "phones",
    condition: "used",
    brand: "Apple",
    image_url:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
    stock: 10,
  },
  {
    id: "magsafe-charger",
    name: "Caricatore MagSafe 15W Originale",
    price: 45,
    category: "accessories",
    condition: null,
    brand: "Apple",
    image_url:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=600&fit=crop",
    stock: 40,
  },
];

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
