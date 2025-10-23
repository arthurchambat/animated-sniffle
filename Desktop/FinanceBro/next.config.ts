import type { NextConfig } from "next";

const isTurbopack = process.env.TURBOPACK === "1";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.ts": {
          sideEffects: false
        }
      }
    },
    ...(isTurbopack ? {} : { typedRoutes: true })
  }
};

export default nextConfig;
