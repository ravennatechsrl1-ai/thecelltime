import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0a0a0a",
          navy: "#0f172a",
          electric: "#3b82f6",
          coral: "#f97316",
          emerald: "#10b981",
          violet: "#8b5cf6",
          cyan: "#06b6d4",
          rose: "#f43f5e",
          gray: {
            50: "#fafafa",
            100: "#f4f4f5",
            200: "#e4e4e7",
            300: "#d4d4d8",
            400: "#a1a1aa",
            500: "#71717a",
            600: "#52525b",
            700: "#3f3f46",
            800: "#27272a",
            900: "#18181b",
          },
          accent: "#2563eb",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)",
        "mesh-gradient":
          "radial-gradient(at 20% 30%, rgba(59,130,246,0.35) 0, transparent 50%), radial-gradient(at 80% 20%, rgba(139,92,246,0.3) 0, transparent 45%), radial-gradient(at 60% 80%, rgba(249,115,22,0.25) 0, transparent 50%)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
