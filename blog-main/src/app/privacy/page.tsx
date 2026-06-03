import type { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).privacy;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/privacy',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const text = getDictionary(locale).privacy;
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <header className="mb-16">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-black md:text-5xl lg:text-6xl dark:text-white">
          {text.title}
        </h1>
        <p className="mb-8 text-lg text-black/50 dark:text-white/50">{text.updated}</p>
        <div className="h-[2px] w-16 bg-black dark:bg-white" />
      </header>

      <div className="space-y-8 text-base leading-relaxed text-black/80 dark:text-white/80">
        {text.sections.map((section) => (
          <section key={section[0]} className="space-y-4">
            <h2 className="text-2xl font-medium text-black dark:text-white">{section[0]}</h2>
            <p>{section[1]}</p>
          </section>
        ))}

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">{text.contactTitle}</h2>
          <p>{text.contactText}</p>
          <div className="mt-6 rounded-xl border border-black/[0.06] bg-black/[0.02] p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <p className="mb-2 text-sm text-black/60 dark:text-white/60">{text.email}</p>
            <a
              href={siteConfig.socials.email}
              className="text-lg font-medium text-black transition-colors hover:text-black/60 dark:text-white dark:hover:text-white/60"
            >
              {siteConfig.email}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
