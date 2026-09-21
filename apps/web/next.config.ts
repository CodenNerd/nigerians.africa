import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nigeria-for-nigerians/domain"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
      {
        protocol: "https",
        hostname: "t0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "t1.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "t2.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "t3.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
