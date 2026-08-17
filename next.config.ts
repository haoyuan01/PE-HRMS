import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let the host's web server (LiteSpeed/Apache on Hostinger) handle gzip/brotli.
  // Next.js compressing on top of that can produce double-compressed responses
  // that Chrome rejects over HTTP/2 (ERR_HTTP2_PROTOCOL_ERROR — the intermittent
  // "This page couldn't load" screen).
  compress: false,
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
