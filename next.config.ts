import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow Turbopack/webpack to follow symlinks that point outside the project root
  // (needed for _stackai-components → /Users/davidhid/stackai/services/stackweb/components)
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
