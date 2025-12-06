import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@mastra/*"],
  // Add empty turbopack config to silence the error
  turbopack: {},
};

export default nextConfig;
