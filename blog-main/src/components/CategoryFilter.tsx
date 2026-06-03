'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getPathLocale } from '@/lib/i18n';

interface CategoryFilterProps {
  posts: any[];
  onFilterChange: (category: string | null) => void;
}

export function CategoryFilter({ posts, onFilterChange }: CategoryFilterProps) {
  const locale = getPathLocale(usePathname());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    posts.forEach((post) => {
      const category = post.category || post.tags?.[0];
      if (category) {
        counts[category] = (counts[category] || 0) + 1;
      }
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    onFilterChange(category);
  };

  return (
    <div className="mb-12 flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleCategoryClick(null)}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
          selectedCategory === null
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-black/[0.04] text-black/60 hover:bg-black/[0.08] hover:text-black dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.12] dark:hover:text-white'
        }`}
      >
        <span>{locale === 'en' ? 'All' : '全部'}</span>
        <span className="opacity-50">{posts.length}</span>
      </button>

      {categoryCounts.length > 0 && <div className="h-4 w-px bg-black/10 dark:bg-white/10" />}

      {categoryCounts.map(([category, count]) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
            selectedCategory === category
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-black/[0.04] text-black/60 hover:bg-black/[0.08] hover:text-black dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.12] dark:hover:text-white'
          }`}
        >
          <span>{category}</span>
          <span className="opacity-50">{count}</span>
        </button>
      ))}
    </div>
  );
}
