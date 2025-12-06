import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@mastra/*"],
  // Disable Turbopack to use webpack for better stability
  experimental: {
    turbo: {
      enabled: false,
    },
  },
};

export default nextConfig;
