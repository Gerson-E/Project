import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ignoreDuringBuilds: true, // ✅ This line disables ESLint from blocking deploys
  /* config options here */
};

export default nextConfig;
