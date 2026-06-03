import type { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).pricing;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/pricing',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default async function PricingPage() {
  const text = getDictionary(await getLocale()).pricing;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-24">
      <header className="mb-12 sm:mb-16">
        <h1 className="mb-3 text-3xl font-medium tracking-tight text-black sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
          {text.title}
        </h1>
        <p className="mb-6 max-w-3xl text-base leading-relaxed text-black/60 sm:text-lg dark:text-white/60">
          {text.description}
        </p>
        <div className="h-[2px] w-12 bg-black sm:w-16 dark:bg-white" />
      </header>

      <section className="space-y-6 rounded-3xl border border-black/6 bg-black/[0.02] p-6 sm:p-8 dark:border-white/6 dark:bg-white/[0.02]">
        <div>
          <h2 className="text-2xl font-medium text-black dark:text-white">{text.sectionTitle}</h2>
          <p className="mt-3 text-base leading-relaxed text-black/60 dark:text-white/60">
            {text.sectionText}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href={siteConfig.socials.email}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {text.emailAction}
          </a>
          {siteConfig.socials.github && (
            <a
              href={siteConfig.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.04]"
            >
              {text.githubAction}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
