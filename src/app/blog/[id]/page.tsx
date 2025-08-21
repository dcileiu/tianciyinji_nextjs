import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import ArticleDetailClient from './ArticleDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  // TODO: Fetch article data for SEO
  // For now, using fallback metadata
  // In a real app, you would fetch the article data here:
  // const article = await fetchArticleById(id);
  
  const defaultTitle = "技术文章";
  const defaultDescription = "分享前端开发技术文章，深入探讨现代Web开发技术和最佳实践。";
  
  return {
    title: defaultTitle,
    description: defaultDescription,
    keywords: ["前端开发", "技术文章", "React", "Next.js", "TypeScript", "Web开发"],
    openGraph: {
      title: `${defaultTitle} | 天赐印记`,
      description: defaultDescription,
      url: `https://itianci.cn/blog/${id}`,
      type: "article",
      publishedTime: new Date().toISOString(),
      authors: ["Tianci"],
      tags: ["前端开发", "技术分享"],
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${defaultTitle} | 天赐印记`,
      description: defaultDescription,
      images: ["/og-image.svg"],
    },
    alternates: {
      canonical: `https://itianci.cn/blog/${id}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <>
      <StructuredData 
        type="article" 
        data={{
          url: `https://itianci.cn/blog/${id}`,
          title: "技术文章",
          description: "分享前端开发技术文章，深入探讨现代Web开发技术和最佳实践。",
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }} 
      />
      <ArticleDetailClient id={id} />
    </>
  );
}