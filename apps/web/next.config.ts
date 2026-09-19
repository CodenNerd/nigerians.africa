import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nigeria-for-nigerians/domain"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
    ],
  },
};

export default nextConfig;
