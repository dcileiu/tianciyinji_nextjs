'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import type { Post } from '@/types/post';

interface TimelineProps {
  posts: (Post & { displayDate: string })[];
}

const INITIAL_DISPLAY_COUNT = 3;

function TimelineItem({ post, readMore, href }: { post: Post & { displayDate: string }; readMore: string; href: Route }) {
  return (
    <Link key={post.slug} href={href} className="block group relative">
      <div className="absolute left-0 top-2 flex items-center justify-center w-6 h-6">
        <div className="absolute w-6 h-6 bg-black/[0.03] dark:bg-white/[0.08] rounded-full transform origin-center transition-all duration-500 ease-out group-hover:scale-[2.5] group-hover:opacity-40 dark:group-hover:opacity-60" />
        <div className="absolute w-3 h-3 bg-black/[0.06] dark:bg-white/[0.15] rounded-full transform origin-center transition-all duration-500 ease-out delay-75 group-hover:scale-150" />
        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full transform origin-center transition-all duration-500 ease-out delay-100" />
      </div>

      <div className="pl-14">
        <article className="flex-grow">
          <time className="text-sm font-medium text-black/40 dark:text-white/40 mb-4 block">{post.displayDate}</time>

          <h2 className="text-[1.75rem] leading-snug mb-4 font-medium text-black dark:text-white break-words">
            {post.title}
          </h2>

          {post.tags?.[0] && (
            <div className="mb-4">
              <span className="inline-flex px-4 py-1.5 text-[13px] leading-relaxed rounded-full bg-black/[0.02] dark:bg-white/[0.02] text-black/50 dark:text-white/50 border border-black/[0.04] dark:border-white/[0.04]">
                {post.tags[0]}
              </span>
            </div>
          )}

          <p className="text-[17px] text-black/50 dark:text-white/50 leading-relaxed break-words">{post.excerpt}</p>

          <div className="mt-6 flex items-center text-[15px] text-black/40 dark:text-white/40">
            <span className="font-medium">{readMore}</span>
            <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
              <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 12H4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </article>
      </div>
    </Link>
  );
}

export default function ExpandableTimeline({ posts }: TimelineProps) {
  const { locale, localizedHref } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const text =
    locale === 'en'
      ? {
          empty: 'No updates in the last six months...',
          readMore: 'Continue reading',
          collapse: 'Collapse',
          expand: 'Show more',
        }
      : {
          empty: '最近六个月暂无更新...',
          readMore: '继续阅读',
          collapse: '收起内容',
          expand: '展开更多',
        };

  const recentPosts = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return posts.filter((post) => {
      const postDate = new Date(post.date);
      return !isNaN(postDate.getTime()) && postDate >= sixMonthsAgo;
    });
  }, [posts]);

  const displayPosts = recentPosts.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMorePosts = recentPosts.length > INITIAL_DISPLAY_COUNT;

  if (recentPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-black/60 dark:text-white/60">{text.empty}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-0 w-[1.5px] bg-black/[0.07] dark:bg-white/[0.07] rounded-full z-0" />

      <div className="space-y-16">
        {displayPosts.map((post) => (
          <TimelineItem
            key={post.slug}
            post={post}
            readMore={text.readMore}
            href={localizedHref(`/post/${post.slug}`) as Route}
          />
        ))}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'
          }`}
        >
          <div className="space-y-16">
            {recentPosts.slice(INITIAL_DISPLAY_COUNT).map((post) => (
              <TimelineItem
                key={post.slug}
                post={post}
                readMore={text.readMore}
                href={localizedHref(`/post/${post.slug}`) as Route}
              />
            ))}
          </div>
        </div>
      </div>

      {hasMorePosts && (
        <div className="flex justify-center pt-6 relative z-40">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <span>{isExpanded ? text.collapse : text.expand}</span>
            <svg className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
