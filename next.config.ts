import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:4000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
