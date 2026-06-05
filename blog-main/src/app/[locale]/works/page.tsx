import { ArrowUpRight } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { WorkCarousel } from '@/components/WorkCarousel';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';
import { getWorks, getWorksIntro } from '@/lib/works';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const text = getDictionary(locale).works;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/works',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const dictionary = getDictionary(locale);
  const worksText = dictionary.works;
  const works = getWorks(locale);
  const worksIntro = getWorksIntro(locale);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16 md:px-6 md:py-24">
      <header className="mb-12 sm:mb-16">
        <h1 className="mb-4 text-3xl font-medium tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
          {worksText.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-black/55 sm:text-base md:text-lg dark:text-white/55">
          {worksIntro}
        </p>
        <div className="mt-6 h-[2px] w-12 bg-black sm:w-16 dark:bg-white" />
      </header>

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
        {works.map((work) => (
          <article
            key={work.title}
            className="overflow-hidden rounded-3xl border border-black/6 bg-black/[0.02] transition-colors hover:bg-black/[0.03] dark:border-white/6 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
          >
            <div className="p-4 sm:p-5">
              <WorkCarousel images={work.images} alt={work.title} />
            </div>

            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
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

                  {work.description && work.description.length > 0 && (
                    <div className="mt-3 space-y-2 text-sm leading-relaxed text-black/50 dark:text-white/50">
                      {work.description.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}

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
                  <Link
                    href={work.href as Route}
                    className="inline-flex shrink-0 items-center gap-2 text-sm text-black/55 transition-colors hover:text-black md:mt-1 dark:text-white/55 dark:hover:text-white"
                  >
                    {work.linkLabel || worksText.linkFallback}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
