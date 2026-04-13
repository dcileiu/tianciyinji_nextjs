import { Metadata } from "next";
import StructuredData from "@/components/StructuredData";
import ArticleDetailClient from "./ArticleDetailClient";
import { getArticleByIdForPublic } from "@/server/queries/blog";
import type { Article } from "@/store/articleStore";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function descFromArticle(a: Article) {
  const t = (a.content || "")
    .replace(/[#*`>\s\n]+/g, " ")
    .slice(0, 160)
    .trim();
  return t || "分享前端开发技术文章，深入探讨现代Web开发技术和最佳实践。";
}

function ogImageUrl(article: Article | null) {
  if (!article?.coverImage) return "https://itianci.cn/og-image.svg";
  if (article.coverImage.startsWith("http")) return article.coverImage;
  const path = article.coverImage.startsWith("/")
    ? article.coverImage
    : `/${article.coverImage}`;
  return `https://itianci.cn${path}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const nid = Number(id);
  if (!nid) {
    return { title: "文章未找到" };
  }
  let article: Article | null = null;
  try {
    article = (await getArticleByIdForPublic(nid)) as Article | null;
  } catch {
    article = null;
  }
  if (!article) {
    return {
      title: "文章未找到",
      description: "请求的文章不存在或未发布。",
    };
  }
  const description = descFromArticle(article);
  const canonical = `https://itianci.cn/blog/${id}`;
  const ogImage = ogImageUrl(article);

  return {
    title: article.title,
    description,
    keywords: article.tags,
    openGraph: {
      title: `${article.title} | 天赐印记`,
      description,
      url: canonical,
      type: "article",
      publishedTime: String(article.createdAt),
      modifiedTime: String(article.updatedAt),
      authors: ["Tianci"],
      tags: article.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | 天赐印记`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const nid = Number(id);
  let article: Article | null = null;
  if (nid) {
    try {
      article = (await getArticleByIdForPublic(nid)) as Article | null;
    } catch {
      article = null;
    }
  }

  const canonical = `https://itianci.cn/blog/${id}`;

  return (
    <>
      <StructuredData
        type="article"
        data={{
          title: article?.title ?? "技术文章",
          description: article
            ? descFromArticle(article)
            : "分享前端开发技术文章，深入探讨现代Web开发技术和最佳实践。",
          publishedAt: article?.createdAt
            ? String(article.createdAt)
            : new Date().toISOString(),
          updatedAt: article?.updatedAt
            ? String(article.updatedAt)
            : new Date().toISOString(),
          url: canonical,
          image: ogImageUrl(article),
        }}
      />
      <ArticleDetailClient id={id} initialArticle={article} />
    </>
  );
}
