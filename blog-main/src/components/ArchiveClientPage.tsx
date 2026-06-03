// src/components/ArchiveClientPage.tsx
'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useMemo, useState } from 'react';
import { localizedHref, type Locale } from '@/lib/i18n';
import { CategoryFilter } from './CategoryFilter';

interface ArchiveClientPageProps {
  locale: Locale;
  posts: any[];
  text: {
    empty: string;
    stats: string;
    title: string;
  };
}

/**
 * 格式化日期为年月
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
}

/**
 * 按年份分组文章（输入已是轻量元数据）
 */
function groupPostsByYear(posts: any[]) {
  const groups: Record<string, any[]> = {};
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    (groups[year] ||= []).push(post);
  }
  // 年份降序
  return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
}

export default function ArchiveClientPage({ locale, posts, text }: ArchiveClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 预处理：补充 year
  const prepared = useMemo(() => {
    return posts.map((p) => {
      const year = new Date(p.date).getFullYear();
      const wc = p.wordCount || 0;
      return { ...p, __year: year, __wc: wc };
    });
  }, [posts]);

  // 筛选文章
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return prepared;
    return prepared.filter((post) => {
      // 优先使用 category，回退到 tags[0]（兼容旧数据）
      const category = post.category || post.tags?.[0];
      return category === selectedCategory;
    });
  }, [prepared, selectedCategory]);

  const groupedPosts = useMemo(() => groupPostsByYear(filteredPosts), [filteredPosts]);

  // 统计信息
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let thisYearCount = 0;
    let totalWords = 0;

    for (const p of prepared) {
      totalWords += Number(p.__wc) || 0;
      if (p.__year === currentYear) thisYearCount++;
    }

    return {
      thisYearCount,
      totalWords: totalWords.toLocaleString(),
    };
  }, [prepared]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
      {/* 页面标题 */}
      <header className="mb-12 md:mb-16">
        <div className="rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-5 dark:border-white/6 dark:bg-white/[0.02] md:px-6 md:py-6">
          <h1 className="mb-4 text-4xl font-medium tracking-tight text-black md:text-5xl lg:text-6xl dark:text-white">
            {text.title}
          </h1>
          <p className="mb-8 text-lg text-black/50 dark:text-white/50">
            {text.stats.replace('{count}', String(stats.thisYearCount)).replace('{words}', stats.totalWords)}
          </p>
          <div className="h-[2px] w-16 bg-black dark:bg-white" />
        </div>
      </header>

      {/* 分类筛选 */}
      <CategoryFilter posts={posts} onFilterChange={setSelectedCategory} />

      {/* 按年份分组的文章列表 */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-16">
          {groupedPosts.map(([year, yearPosts]: [string, any[]]) => (
            <section key={year}>
              {/* 年份标题 */}
              <h2 className="sticky top-4 z-10 mb-8 rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-4 text-2xl font-medium text-black dark:border-white/6 dark:bg-white/[0.02] dark:text-white md:text-3xl">
                {year}
              </h2>

              {/* 该年份的文章 */}
              <div className="space-y-0">
                {yearPosts.map((post: any) => {
                  // 优先使用 category，回退到 tags[0]（兼容旧数据）
                  const category = post.category || post.tags?.[0];
                  const formattedDate = formatDate(post.date);

                  return (
                    <Link
                      key={post.slug}
                      href={localizedHref(`/post/${post.slug}`, locale) as Route}
                      className="group block py-6 border-b border-black/[0.06] dark:border-white/[0.06] last:border-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] -mx-4 px-4 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-4">
                        {/* 标题 */}
                        <h3 className="text-lg md:text-xl font-medium text-black dark:text-white group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors flex-1">
                          {post.title}
                        </h3>

                        {/* 右侧信息 */}
                        <div className="flex items-center gap-3 text-sm text-black/40 dark:text-white/40 flex-shrink-0">
                          {category && (
                            <>
                              <span className="hidden md:inline">{category}</span>
                              <span className="hidden md:inline">·</span>
                            </>
                          )}
                          <time className="font-mono">{formattedDate}</time>
                        </div>
                      </div>

                      {/* 摘要 */}
                      {post.excerpt && (
                        <p className="mt-2 text-sm text-black/50 dark:text-white/50 line-clamp-1 md:line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-black/40 dark:text-white/40">{text.empty}</p>
        </div>
      )}
    </div>
  );
}
