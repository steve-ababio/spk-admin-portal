import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spk-s3-bucket-801826969262-us-east-2-an.s3.us-east-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
