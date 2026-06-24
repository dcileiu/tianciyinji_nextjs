import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "去水印壁纸鸭 - 在线视频图片去水印下载工具",
  description:
    "去水印壁纸鸭：专注于公众号、抖音、小红书、快手四个平台的视频与图片一键去水印并下载，无需登录，高质量保存。",
  authors: [{ name: "去水印壁纸鸭" }],
  openGraph: {
    title: "去水印壁纸鸭 - 在线去水印工具",
    description:
      "支持公众号、抖音、小红书、快手四个平台，免费在线解析并下载高清无水印内容。",
    url: "https://example.com/",
    siteName: "去水印壁纸鸭",
  },
  twitter: {
    title: "去水印壁纸鸭",
    description:
      "在线去水印并下载工具 — 支持抖音、小红书、快手等平台，快速解析并保存高清内容。",
    card: "summary_large_image",
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
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://example.com/#organization",
              "name": "去水印壁纸鸭",
              "url": "https://example.com/",
              "logo": "https://example.com/avatar/logo.png"
            },
            {
              "@type": "WebSite",
              "@id": "https://example.com/#website",
              "url": "https://example.com/",
              "name": "去水印壁纸鸭",
              "publisher": { "@id": "https://example.com/#organization" }
            }
          ]
        }) }}/>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
