import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
