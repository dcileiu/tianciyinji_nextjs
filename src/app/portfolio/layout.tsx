import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "个人作品集",
  description: "展示Tianci在全栈开发、前端架构、数据可视化、移动开发等领域的项目作品，包括VCC卡系统、API文档协同编辑系统、博客系统等优秀作品。",
  keywords: ["个人作品集", "全栈开发", "前端项目", "React项目", "Vue项目", "Next.js", "TypeScript", "数据可视化", "移动开发"],
  openGraph: {
    title: "个人作品集 | 天赐印记",
    description: "展示Tianci在全栈开发、前端架构、数据可视化等领域的项目作品集。",
    url: "https://itianci.cn/portfolio",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "天赐印记 - 个人作品集",
      },
    ],
  },
  twitter: {
    title: "个人作品集 | 天赐印记",
    description: "展示Tianci在全栈开发、前端架构、数据可视化等领域的项目作品集。",
  },
  alternates: {
    canonical: "https://itianci.cn/portfolio",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData
        type="website"
        data={{
          name: "个人作品集 | 天赐印记",
          description: "展示Tianci在全栈开发、前端架构、数据可视化等领域的项目作品集",
          url: "https://itianci.cn/portfolio",
        }}
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "首页", url: "https://itianci.cn" },
            { name: "个人作品集", url: "https://itianci.cn/portfolio" },
          ],
        }}
      />
      {children}
    </>
  );
}
