import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
    turbo: {
      rules: {
        "*.ts": {
          sideEffects: false
        }
      }
    }
  }
};

export default nextConfig;
