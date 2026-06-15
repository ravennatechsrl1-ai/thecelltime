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
          black: "#05080f",
          navy: "#0a1628",
          "navy-light": "#132238",
          electric: "#1e6bff",
          "electric-dark": "#1554cc",
          "electric-light": "#4d8dff",
          silver: "#b8c4d4",
          coral: "#f97316",
          emerald: "#10b981",
          violet: "#8b5cf6",
          cyan: "#06b6d4",
          rose: "#f43f5e",
          gray: {
            50: "#f5f7fa",
            100: "#eef1f6",
            200: "#dde3ed",
            300: "#c5cedc",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
          },
          accent: "#1e6bff",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0a1628 0%, #132238 50%, #1e3a6e 100%)",
        "mesh-gradient":
          "radial-gradient(at 20% 30%, rgba(30,107,255,0.18) 0, transparent 50%), radial-gradient(at 80% 20%, rgba(77,141,255,0.12) 0, transparent 45%), radial-gradient(at 60% 80%, rgba(10,22,40,0.08) 0, transparent 50%)",
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
        card: "0 0 0 1px rgba(10,22,40,0.06), 0 1px 2px rgba(10,22,40,0.04)",
        "card-hover":
          "0 0 0 1px rgba(30,107,255,0.12), 0 8px 24px rgba(30,107,255,0.08)",
        "glow-electric": "0 4px 20px rgba(30,107,255,0.25)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
