import type { Metadata } from 'next';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';

const friendsDescription =
  '朋友站点、创作者链接与常逛的实用站点。';

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('友链'),
  description: friendsDescription,
  path: '/friends',
  keywords: ['友链', '友情链接', '创作者推荐'],
});

const friends = [
  {
    name: '刘明野的工具箱',
    href: 'https://tools.liumingye.cn/',
    description: '好用、易用的在线工具与站点导航，内容持续扩充。',
  },
] as const;

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <header className="mb-16">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-black md:text-5xl lg:text-6xl dark:text-white">
          友链
        </h1>
        <p className="mb-8 text-lg text-black/50 dark:text-white/50">
          {friendsDescription}
        </p>
        <div className="h-[2px] w-16 bg-black dark:bg-white" />
      </header>

      <ul className="flex flex-col gap-4">
        {friends.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="group flex h-full flex-col rounded-3xl border border-black/6 bg-black/[0.02] p-6 transition-colors hover:border-black/12 hover:bg-black/[0.04] sm:p-8 dark:border-white/6 dark:bg-white/[0.02] dark:hover:border-white/12 dark:hover:bg-white/[0.04]"
            >
              <span className="mb-2 text-lg font-medium text-black group-hover:underline dark:text-white">
                {item.name}
              </span>
              <span className="mb-4 flex-1 text-sm leading-relaxed text-black/65 dark:text-white/65">
                {item.description}
              </span>
              <span className="text-sm text-black/45 dark:text-white/45">
                {item.href.replace(/^https:\/\//, '')}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
