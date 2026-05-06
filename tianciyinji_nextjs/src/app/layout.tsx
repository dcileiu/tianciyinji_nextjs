/*
 * @Author: tianci tianci1208@outlook.com
 * @Date: 2025-07-18 23:33:28
 * @LastEditors: tianci dex_Liu@outlook.com
 * @LastEditTime: 2025-07-27 18:21:53
 * @FilePath: \my-website\src\app\layout.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import DynamicHeader from "../components/layout/DynamicHeader";
import StructuredData from "@/components/StructuredData";
import PageTransition from "../components/layout/PageTransition";
import PublicVisitTracker from "@/components/analytics/PublicVisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://itianci.cn'),
  title: {
    default: "天赐印记",
    template: "%s | 天赐印记"
  },
  description: "欢迎来到Tianci的个人网站！这里分享前端开发技术、项目作品和技术博客。专注于React、Next.js、TypeScript等现代Web开发技术。",
  keywords: ["前端开发", "React", "Next.js", "TypeScript", "Web开发", "个人博客", "技术分享", "Tianci"],
  authors: [{ name: "Tianci", url: "https://github.com/tianci" }],
  creator: "Tianci",
  publisher: "Tianci",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://itianci.cn",
    title: "天赐印记 - 前端开发者个人网站",
    description: "欢迎来到Tianci的个人网站！这里分享前端开发技术、项目作品和技术博客。",
    siteName: "天赐印记",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "天赐印记",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "天赐印记 - 前端开发者个人网站",
    description: "欢迎来到Tianci的个人网站！这里分享前端开发技术、项目作品和技术博客。",
    images: ["/og-image.svg"],
    creator: "@tianci",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "天赐印记",
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: "https://itianci.cn",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 远程图片 CDN 预连接，降低首屏图片 TTFB */}
        <link rel="dns-prefetch" href="//s2.loli.net" />
        <link rel="preconnect" href="https://s2.loli.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//p1.qhimg.com" />
        {/* Fix for markdown-it isSpace error with Next.js 15 + Turbopack */}
        <Script id="markdown-it-fix" strategy="beforeInteractive">
          {`
            if (typeof globalThis !== 'undefined' && typeof globalThis.isSpace === 'undefined') {
              globalThis.isSpace = function(code) {
                return code === 0x20 || code === 0x09 || code === 0x0A || code === 0x0B || code === 0x0C || code === 0x0D;
              };
            }
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={true}
        >
          <StructuredData type="website" />
          <StructuredData type="person" />
          <DynamicHeader />
          <PageTransition>
            {children}
          </PageTransition>
          <PublicVisitTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
