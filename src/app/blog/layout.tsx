import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "技术博客",
  description: "分享前端开发技术文章，包括React、Next.js、TypeScript、CSS等现代Web开发技术的深度解析和实战经验。",
  keywords: ["技术博客", "前端开发", "React", "Next.js", "TypeScript", "Web开发", "编程教程"],
  openGraph: {
    title: "技术博客 | Tianci's Portfolio",
    description: "分享前端开发技术文章，包括React、Next.js、TypeScript等现代Web开发技术。",
    type: "website",
    url: "https://itianci.cn/blog",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Tianci's Tech Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "技术博客 | Tianci's Portfolio",
    description: "分享前端开发技术文章，包括React、Next.js、TypeScript等现代Web开发技术。",
    images: ["/og-image.svg"],
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