import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
// import HomeIntroOverlay from "@/components/HomeIntroOverlay";
// import HomeRepulsionField from '@/components/HomeRepulsionField';
import { siteConfig } from "@/lib/site-config";
import JsonLd from "@/components/JsonLd";
import {
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import type { Post } from "@/types/post";
import { getBlogPosts } from "@/utils/posts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const dictionary = getDictionary(locale);
  return buildPageMetadata({
    title: siteConfig.name,
    description: dictionary.home.intro,
    path: "/",
    keywords:
      locale === 'en'
        ? ['personal blog', 'full-stack development', 'portfolio', 'resources']
        : ["个人博客", "全栈开发", "作品集", "资源整理"],
    locale,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const { posts, total } = await getBlogPosts(1);

  return (
    <>
      <JsonLd
        data={[
          buildCollectionPageJsonLd({
            title: siteConfig.name,
            description: siteConfig.home.intro,
            path: "/",
            locale,
          }),
          buildItemListJsonLd(
            posts.map((post) => ({
              name: post.title,
              path: `/post/${post.slug}`,
            })),
          ),
        ]}
      />
      {/* 首屏开场加载动画，已按需关闭 */}
      {/* <HomeIntroOverlay /> */}
      <HomePageClient posts={posts as Post[]} total={total} />
      {/* <HomeRepulsionField /> */}
    </>
  );
}
