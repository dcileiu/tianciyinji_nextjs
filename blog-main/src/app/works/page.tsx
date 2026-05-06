import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import { pageTitle, siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: pageTitle('作品'),
  description: '用于展示项目、案例和长期维护中的作品。',
  openGraph: {
    title: pageTitle('作品'),
    description: '用于展示项目、案例和长期维护中的作品。',
    siteName: siteConfig.name,
  },
};

export default function WorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16 md:px-6 md:py-24">
      <header className="mb-12 sm:mb-16">
        <h1 className="mb-4 text-3xl font-medium tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
          作品
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-black/55 sm:text-base md:text-lg dark:text-white/55">
          {siteConfig.works.intro}
        </p>
        <div className="mt-6 h-[2px] w-12 bg-black sm:w-16 dark:bg-white" />
      </header>

      <div className="space-y-4">
        {siteConfig.works.items.map((work) => (
          <article
            key={work.title}
            className="rounded-3xl border border-black/6 bg-black/[0.02] p-6 transition-colors hover:bg-black/[0.03] sm:p-8 dark:border-white/6 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                    {work.status}
                  </span>
                  <span className="text-xs text-black/45 dark:text-white/45">{work.year}</span>
                </div>

                <h2 className="text-2xl font-medium text-black dark:text-white">{work.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-black/60 sm:text-base dark:text-white/60">
                  {work.summary}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs text-black/65 dark:bg-white/[0.06] dark:text-white/65"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {work.href && (
                <a
                  href={work.href}
                  className="inline-flex items-center gap-2 text-sm text-black/55 transition-colors hover:text-black md:mt-1 dark:text-white/55 dark:hover:text-white"
                >
                  查看页面
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
