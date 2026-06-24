import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wallpaper.cdn.itianci.cn",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
