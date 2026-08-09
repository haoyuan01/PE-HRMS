import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "havyh.xyz",
      },
      {
        protocol: "http",
        hostname: "havyh.xyz",
      },
      {
        protocol: "https",
        hostname: "peachpuff-seal-112546.hostingersite.com",
      },
    ],
  },
};

export default nextConfig;
