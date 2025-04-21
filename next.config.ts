import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❗️DON’T put this at the top level – it must live inside `eslint`
    ignoreDuringBuilds: true,
  },
  typescript: {
    // optional – only if you also want TS errors to be warnings
    ignoreBuildErrors: true,
  },
};

export default nextConfig;