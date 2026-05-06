import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "技术博客",
  description: "分享前端开发技术文章，包括React、Next.js、TypeScript、JavaScript等现代Web开发技术的深度解析和实践经验。",
  keywords: ["前端开发", "技术博客", "React教程", "Next.js教程", "TypeScript", "JavaScript", "Web开发技巧", "编程经验"],
  openGraph: {
    title: "技术博客 | 天赐印记",
    description: "分享前端开发技术文章，包括React、Next.js、TypeScript等现代Web开发技术。",
    url: "https://itianci.cn/blog",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "天赐印记 - 技术博客",
      },
    ],
  },
  twitter: {
    title: "技术博客 | 天赐印记",
    description: "分享前端开发技术文章，包括React、Next.js、TypeScript等现代Web开发技术。",
  },
  alternates: {
    canonical: "https://itianci.cn/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData type="blog" />
      {children}
    </>
  );
}