import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets-ng.maxroll.gg",
      },
      {
        protocol: "https",
        hostname: "assets.maxroll.gg",
      },
    ],
  },
};

export default nextConfig;
