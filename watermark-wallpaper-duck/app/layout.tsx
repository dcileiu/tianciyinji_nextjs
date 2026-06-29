import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { buildJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title:
    "去水印壁纸鸭 - 免费在线视频图片去水印下载工具|无需登录|支持公众号、抖音、小红书、快手、哔哩哔哩等平台",
  description:
    "去水印壁纸鸭：专注于公众号、抖音、小红书、快手、哔哩哔哩等平台的视频与图片一键去水印并下载，无需登录，高质量保存。",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "去水印",
    "去水印壁纸鸭",
    "抖音去水印",
    "小红书去水印",
    "快手去水印",
    "哔哩哔哩去水印",
    "B站去水印",
    "公众号去水印",
    "视频去水印",
    "图片去水印",
    "无水印下载",
  ],
  authors: [{ name: "去水印壁纸鸭" }],
  icons: {
    icon: "/icons/duck.webp",
    shortcut: "/icons/duck.webp",
    apple: "/icons/duck.webp",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title:
      "去水印壁纸鸭 - 免费在线视频图片去水印下载工具|无需登录|支持公众号、抖音、小红书、快手、哔哩哔哩等平台",
    description:
      "支持公众号、抖音、小红书、快手、哔哩哔哩等平台的视频与图片一键去水印并下载，无需登录，高质量保存。",
    url: SITE_URL,
    siteName: "去水印壁纸鸭",
    images: [
      {
        url: "https://wallpaper.cdn.itianci.cn/wallpaper-wx/duck.webp",
        alt: "去水印壁纸鸭",
      },
    ],
  },
  twitter: {
    title: "去水印壁纸鸭",
    description:
      "在线去水印并下载工具 — 支持抖音、小红书、快手、哔哩哔哩等平台，快速解析并保存高清内容。",
    card: "summary_large_image",
    images: ["https://wallpaper.cdn.itianci.cn/wallpaper-wx/duck.webp"],
  },
  other: {
    // GEO 元数据，便于部分搜索引擎地域索引
    "geo.region": "CN",
    "geo.placename": "China",
    "geo.position": "35.8617;104.1954",
    ICBM: "35.8617,104.1954",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildJsonLd();

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
