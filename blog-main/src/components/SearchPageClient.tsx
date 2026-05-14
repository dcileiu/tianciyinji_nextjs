'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  coverImage: string | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query: string) {
  if (!query) return text;

  try {
    const escapedQuery = escapeRegExp(query);
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-transparent text-black dark:text-white underline decoration-2 underline-offset-2"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch {
    return text;
  }
}

export default function SearchPageClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto px-4 py-16 article-content-width md:px-6 md:py-24">
      <header className="mb-16 md:mb-20">
        <h1 className="mb-6 text-5xl font-medium tracking-tight text-black dark:text-white md:text-6xl lg:text-7xl">
          搜索
        </h1>
        <div className="mb-12 h-[2px] w-16 bg-black dark:bg-white" />

        <div className="relative">
          <Search
            className={`absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
              loading ? 'animate-pulse text-black/60 dark:text-white/60' : 'text-black/30 dark:text-white/30'
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入即可搜索..."
            className="w-full border-b border-black/10 bg-transparent py-3 pl-8 pr-8 text-xl text-black transition-colors placeholder:text-black/30 focus:border-black/30 focus:outline-none dark:border-white/10 dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/30"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-black/30 transition-colors hover:text-black dark:text-white/30 dark:hover:text-white"
              aria-label="清空"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {hasSearched && (
        <>
          {results.length > 0 ? (
            <>
              <div className="mb-8 text-sm text-black/40 dark:text-white/40">{results.length} 篇文章</div>
              <div>
                <AnimatePresence mode="popLayout">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                    >
                      <Link
                        href={`/post/${result.slug}`}
                        className="group -mx-4 grid grid-cols-[80px_1fr] gap-8 border-b border-black/5 px-4 py-10 transition-colors last:border-0 hover:bg-black/[0.01] md:grid-cols-[120px_1fr] md:gap-12 dark:border-white/5 dark:hover:bg-white/[0.01]"
                      >
                        <time className="pt-1 font-mono text-sm text-black/40 dark:text-white/40">
                          {formatDate(result.date)}
                        </time>

                        <div className="min-w-0">
                          <h2 className="mb-3 text-2xl font-medium leading-tight text-black transition-colors group-hover:text-black/60 dark:text-white dark:group-hover:text-white/60 md:text-3xl">
                            {highlightText(result.title, query)}
                          </h2>

                          {result.excerpt && (
                            <p className="mb-3 line-clamp-2 text-base leading-relaxed text-black/50 dark:text-white/50">
                              {highlightText(result.excerpt, query)}
                            </p>
                          )}

                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {result.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs text-black/40 dark:text-white/40">
                                  {highlightText(tag, query)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-black/40 dark:text-white/40">未找到相关文章</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

