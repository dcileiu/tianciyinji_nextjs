import Link from 'next/link';
import HomeTitleSvg from '@/components/HomeTitleSvg';
import { siteConfig } from '@/lib/site-config';
import type { Post } from '@/types/post';
import { getBlogPosts } from '@/utils/posts';

export const revalidate = 30;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function PostItem({ post }: { post: Post }) {
  const formattedDate = formatDate(post.date);

  return (
    <Link
      href={`/post/${post.slug}`}
      className="group grid grid-cols-[70px_1fr] gap-4 border-b border-black/5 px-2 py-6 transition-colors last:border-0 hover:bg-black/[0.01] sm:-mx-4 sm:grid-cols-[90px_1fr] sm:gap-6 sm:px-4 sm:py-8 md:grid-cols-[120px_1fr] md:gap-12 md:py-10 dark:border-white/5 dark:hover:bg-white/[0.01]"
    >
      <time className="pt-0.5 font-mono text-xs text-black/40 sm:pt-1 sm:text-sm dark:text-white/40">
        {formattedDate}
      </time>

      <div className="min-w-0">
        <h2 className="mb-2 text-xl font-medium leading-tight text-black transition-colors group-hover:text-black/60 sm:mb-3 sm:text-2xl md:text-3xl dark:text-white dark:group-hover:text-white/60">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-black/50 sm:text-base dark:text-white/50">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function Page() {
  const { posts, total } = await getBlogPosts(1);
  const homeTitleLines: [string, string, string] = [
    '欢迎来打我的个人主页',
    '记录博客、作品、资源与一些长期主义的尝试。',
    '全栈开发一枚',
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-24">
      <header className="mb-12 sm:mb-16 md:mb-20 lg:mb-32">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-black/35 sm:mb-5 sm:text-sm dark:text-white/35">
          {siteConfig.home.eyebrow}
        </p>
        <h1 className="mb-4 sm:mb-5 md:mb-6">
          <span className="sr-only">{homeTitleLines.join(' / ')}</span>
          <HomeTitleSvg className="w-full max-w-[860px]" lines={homeTitleLines} />
        </h1>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-black/55 sm:mb-8 sm:text-base md:text-lg dark:text-white/55">
          {siteConfig.home.intro}
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-black/50 sm:mb-8 dark:text-white/50">
          <Link href="/about" className="transition-colors hover:text-black dark:hover:text-white">
            了解我
          </Link>
          <Link href="/works" className="transition-colors hover:text-black dark:hover:text-white">
            查看作品
          </Link>
          <Link href="/resources" className="transition-colors hover:text-black dark:hover:text-white">
            浏览资源
          </Link>
        </div>
        <div className="h-[2px] w-12 bg-black sm:w-14 md:w-16 dark:bg-white" />
      </header>

      <section>
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-medium text-black sm:text-xl md:text-2xl dark:text-white">最近更新</h2>
          <p className="mt-2 text-sm text-black/50 sm:text-base dark:text-white/50">最新发布的文章会出现在这里。</p>
        </div>

        {posts.map((post) => (
          <PostItem key={post.slug} post={post as unknown as Post} />
        ))}
      </section>

      {total > 10 && (
        <div className="mt-10 border-t border-black/5 pt-10 sm:mt-12 sm:pt-12 md:mt-16 md:pt-16 dark:border-white/5">
          <Link
            href="/archive"
            className="inline-flex text-sm text-black/50 transition-colors hover:text-black sm:text-base dark:text-white/50 dark:hover:text-white"
          >
            查看全部 →
          </Link>
        </div>
      )}
    </div>
  );
}
