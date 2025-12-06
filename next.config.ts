import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@mastra/*"],
  experimental: {
    serverComponentsExternalPackages: ["@mastra/core"],
  },
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;
