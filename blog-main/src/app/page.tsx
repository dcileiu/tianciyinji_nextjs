import { ArrowUpRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import HomeIntroOverlay from "@/components/HomeIntroOverlay";
// import HomeRepulsionField from '@/components/HomeRepulsionField';
import HomeTitleTyper from "@/components/HomeTitleTyper";
import { siteConfig } from "@/lib/site-config";
import JsonLd from "@/components/JsonLd";
import {
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import type { Post } from "@/types/post";
import { getBlogPosts } from "@/utils/posts";

export const metadata: Metadata = buildPageMetadata({
  title: siteConfig.name,
  description: siteConfig.home.intro,
  path: "/",
  keywords: ["个人博客", "全栈开发", "作品集", "资源整理"],
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function PostItem({ post }: { post: Post }) {
  const formattedDate = formatDate(post.date);
  const categoryLabel = post.category?.trim() || "博客";

  return (
    <Link
      href={`/post/${post.slug}`}
      className="group block rounded-3xl border border-black/6 bg-black/[0.02] p-6 transition-colors hover:bg-black/[0.03] sm:p-8 dark:border-white/6 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
              {categoryLabel}
            </span>
            <span className="text-xs text-black/45 dark:text-white/45">{formattedDate}</span>
          </div>

          <h2 className="text-2xl font-medium text-black dark:text-white">{post.title}</h2>

          {post.excerpt && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-black/60 sm:text-base dark:text-white/60">
              {post.excerpt}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs text-black/65 dark:bg-white/[0.06] dark:text-white/65"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 text-sm text-black/55 transition-colors group-hover:text-black md:mt-1 dark:text-white/55 dark:group-hover:text-white">
          阅读文章
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export default async function Page() {
  const { posts, total } = await getBlogPosts(1);
  const homeTitleLines: [string, string] = [
    "全栈开发一枚",
    "记录博客、作品、资源与一些长期主义的尝试",
  ];

  return (
    <>
      <JsonLd
        data={[
          buildCollectionPageJsonLd({
            title: siteConfig.name,
            description: siteConfig.home.intro,
            path: "/",
          }),
          buildItemListJsonLd(
            posts.map((post) => ({
              name: post.title,
              path: `/post/${post.slug}`,
            })),
          ),
        ]}
      />
      <HomeIntroOverlay />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-24">
        <header className="relative mb-16 overflow-hidden rounded-[32px] border border-[#e5dbff] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(244,237,255,0.92))] px-6 py-8 shadow-[0_24px_80px_rgba(91,61,245,0.09)] sm:mb-20 sm:px-8 sm:py-10 md:mb-24 md:px-10 md:py-12 lg:mb-28 dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.88),rgba(15,11,27,0.94))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(126,92,255,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(216,205,255,0.18),transparent_34%)]" />
          <div className="relative">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#7f71ab] sm:mb-5 sm:text-sm dark:text-[#ab9cd8]">
              {siteConfig.home.eyebrow}
            </p>

            <h1 className="mb-4 sm:mb-5 md:mb-6">
              <span className="sr-only">{homeTitleLines.join(" / ")}</span>
              <HomeTitleTyper
                className="w-full max-w-[960px]"
                lines={homeTitleLines}
              />
            </h1>

            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-[#615488] sm:mb-8 sm:text-base md:text-lg dark:text-[#c7baf1]">
              {siteConfig.home.intro}
            </p>

            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-[#7769a0] sm:mb-8 dark:text-[#b5a8df]">
              <Link
                href="/about"
                className="transition-colors hover:text-[#5b3df5] dark:hover:text-[#d8cdff]"
              >
                了解我
              </Link>
              <Link
                href="/works"
                className="transition-colors hover:text-[#5b3df5] dark:hover:text-[#d8cdff]"
              >
                查看作品
              </Link>
              <Link
                href="/resources"
                className="transition-colors hover:text-[#5b3df5] dark:hover:text-[#d8cdff]"
              >
                浏览资源
              </Link>
              <Link
                href={"/tools" as Route}
                className="transition-colors hover:text-[#5b3df5] dark:hover:text-[#d8cdff]"
              >
                实用工具
              </Link>
            </div>

            <div className="h-[2px] w-12 bg-[#5b3df5] sm:w-14 md:w-16 dark:bg-[#d8cdff]" />
          </div>
        </header>

        <section>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg font-medium text-[#2e2150] sm:text-xl md:text-2xl dark:text-white">
              最近更新
            </h2>
            <p className="mt-2 text-sm text-[#7769a0] sm:text-base dark:text-[#b5a8df]">
              最新发布的文章会出现在这里。
            </p>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <PostItem key={post.slug} post={post as unknown as Post} />
            ))}
          </div>
        </section>

        {total > 10 && (
          <div className="mt-10 border-t border-[#e7defe] pt-10 sm:mt-12 sm:pt-12 md:mt-16 md:pt-16 dark:border-white/5">
            <Link
              href="/archive"
              className="inline-flex text-sm text-[#7769a0] transition-colors hover:text-[#5b3df5] sm:text-base dark:text-[#b5a8df] dark:hover:text-[#d8cdff]"
            >
              查看全部 →
            </Link>
          </div>
        )}

        {/* <HomeRepulsionField /> */}
      </div>
    </>
  );
}
