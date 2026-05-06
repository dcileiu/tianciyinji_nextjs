import type { Metadata } from 'next';
import { pageTitle, siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: pageTitle('友链'),
  description: '这里以后可以整理朋友站点、推荐博客或常逛的网站。',
  openGraph: {
    title: pageTitle('友链'),
    description: '这里以后可以整理朋友站点、推荐博客或常逛的网站。',
    siteName: siteConfig.name,
  },
};

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <header className="mb-16">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-black md:text-5xl lg:text-6xl dark:text-white">
          友链
        </h1>
        <p className="mb-8 text-lg text-black/50 dark:text-white/50">
          这个页面以后可以放朋友站点、创作者链接或推荐阅读。
        </p>
        <div className="h-[2px] w-16 bg-black dark:bg-white" />
      </header>

      <div className="rounded-3xl border border-black/6 bg-black/[0.02] p-6 sm:p-8 dark:border-white/6 dark:bg-white/[0.02]">
        <p className="max-w-2xl text-base leading-relaxed text-black/65 dark:text-white/65">
          目前这页先留空。等你后面确定要不要做友链、收藏夹或者推荐站点清单时，再把这里补成正式内容会更合适。
        </p>
      </div>
    </div>
  );
}
