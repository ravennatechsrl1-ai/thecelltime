import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Turbopack is used for dev (see package.json). Webpack tweaks apply to production builds only.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      if (config.optimization) {
        config.optimization.moduleIds = "named";
        config.optimization.chunkIds = "named";
      }
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
