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
    ],
  },
};

export default nextConfig;
