import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  /** 优化大型第三方库的 tree-shaking / 按需加载 */
  experimental: {
    optimizePackageImports: [
      "antd",
      "@ant-design/icons",
      "lucide-react",
      "dayjs",
      "echarts",
    ],
  },

  poweredByHeader: false,
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s2.loli.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "p1.qhimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "p1.qhimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
      /** 双保险：让管理后台 & API 永远不被搜索引擎索引 */
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  // Redirects for SEO (if needed)
  async redirects() {
    return [
      // Add redirects here if needed
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  /** 与 Nitro `advertisements/position-[position].get.ts` 路径一致：`/api/advertisements/position-<slot>` */
  async rewrites() {
    return [
      {
        source: "/api/advertisements/position-:position",
        destination: "/api/advertisements/position/:position",
      },
    ];
  },
};

export default nextConfig;
