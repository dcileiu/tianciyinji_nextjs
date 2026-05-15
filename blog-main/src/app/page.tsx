import type { Metadata } from "next";
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

  return (
    <Link
      href={`/post/${post.slug}`}
      className="group mb-4 grid grid-cols-[70px_1fr] gap-4 rounded-[28px] border border-[#e7defe] bg-[linear-gradient(135deg,rgba(255,255,255,0.64),rgba(245,239,255,0.52))] px-4 py-6 shadow-[0_12px_36px_rgba(91,61,245,0.06)] transition-all duration-300 last:mb-0 hover:border-[#bfa7ff] hover:bg-[linear-gradient(135deg,rgba(243,235,255,0.84),rgba(232,223,248,0.74))] hover:shadow-[0_16px_42px_rgba(91,61,245,0.10)] sm:grid-cols-[90px_1fr] sm:gap-6 sm:px-5 sm:py-8 md:grid-cols-[120px_1fr] md:gap-12 md:px-6 md:py-10 dark:border-[#2c2342] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.72),rgba(18,13,31,0.82))] dark:hover:border-[#564092] dark:hover:bg-[linear-gradient(135deg,rgba(33,24,58,0.90),rgba(24,18,42,0.94))] dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.24)]"
    >
      <time className="pt-0.5 font-mono text-xs text-[#8779b3] sm:pt-1 sm:text-sm dark:text-[#9f91c9]">
        {formattedDate}
      </time>

      <div className="min-w-0">
        <h2 className="mb-2 text-xl font-medium leading-tight text-[#2e2150] transition-colors group-hover:text-[#5b3df5] sm:mb-3 sm:text-2xl md:text-3xl dark:text-white dark:group-hover:text-[#d8cdff]">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-[#615488] sm:text-base dark:text-[#c7baf1]">
            {post.excerpt}
          </p>
        )}
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

            <h1 className="mb-6 sm:mb-8 md:mb-10">
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
                href="/tools"
                className="transition-colors hover:text-[#5b3df5] dark:hover:text-[#d8cdff]"
              >
                浏览工具
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

          {posts.map((post) => (
            <PostItem key={post.slug} post={post as unknown as Post} />
          ))}
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
