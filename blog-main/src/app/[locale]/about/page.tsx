import { BriefcaseBusiness, Github, Mail, MapPin, Rss } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import { getGitHubStats } from '@/lib/github';
import { getDictionary, getLocalizedSiteConfig, normalizeLocale } from '@/lib/i18n';
import { hasGithubProfile, pageTitle, siteConfig } from '@/lib/site-config';
import { buildBreadcrumbJsonLd, buildPageMetadata, buildPersonJsonLd } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const dictionary = getDictionary(locale);
  return buildPageMetadata({
    title: pageTitle(dictionary.about.metadataTitle),
    description: dictionary.about.intro,
    path: '/about',
    keywords: [...dictionary.about.metadataKeywords],
    locale,
  });
}

export const revalidate = 3600;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const dictionary = getDictionary(locale);
  const aboutText = dictionary.about;
  const localizedSiteConfig = getLocalizedSiteConfig(locale);
  const githubStats = hasGithubProfile ? await getGitHubStats() : null;
  const socialLinks = [
    localizedSiteConfig.socials.github ? { name: 'GitHub', href: localizedSiteConfig.socials.github, icon: Github } : null,
    { name: 'RSS', href: localizedSiteConfig.socials.rss, icon: Rss },
    { name: 'Email', href: localizedSiteConfig.socials.email, icon: Mail },
  ].filter(Boolean) as Array<{ name: string; href: string; icon: typeof Github }>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <JsonLd
        data={[
          buildPersonJsonLd(locale),
          buildBreadcrumbJsonLd([
            { name: aboutText.breadcrumbs.home, path: '/' },
            { name: aboutText.breadcrumbs.about, path: '/about' },
          ]),
        ]}
      />
      <header className="mb-16 md:mb-20">
        <div className="rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-5 dark:border-white/6 dark:bg-white/[0.02] md:px-6 md:py-6">
          <div className="flex flex-col gap-6 text-center md:flex-row md:items-start md:text-left">
            <div className="mx-auto overflow-hidden rounded-full border border-black/10 md:mx-0 dark:border-white/10">
              <Image
                src={localizedSiteConfig.avatar}
                alt={localizedSiteConfig.name}
                width={112}
                height={112}
                className="h-28 w-28 object-cover"
                priority
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-medium tracking-tight text-black md:text-5xl dark:text-white">
                {localizedSiteConfig.name}
              </h1>
              <p className="mt-3 text-base text-black/60 md:text-lg dark:text-white/60">
                {localizedSiteConfig.tagline}
              </p>

              <div className="mt-5 flex flex-col items-center gap-3 text-sm text-black/55 md:flex-row md:flex-wrap dark:text-white/55">
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4" />
                  {localizedSiteConfig.role}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {localizedSiteConfig.location}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition-colors hover:bg-black/[0.04] hover:text-black dark:border-white/10 dark:text-white/70 dark:hover:bg-white/[0.04] dark:hover:text-white"
                  >
                    <social.icon className="h-4 w-4" />
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {githubStats && (
        <section className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-5 dark:border-white/6 dark:bg-white/[0.02]">
            <div className="text-3xl font-semibold tracking-tight text-black dark:text-white">
              {githubStats.totalStars.toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-black/55 dark:text-white/55">GitHub Stars</p>
          </div>
          <div className="rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-5 dark:border-white/6 dark:bg-white/[0.02]">
            <div className="text-3xl font-semibold tracking-tight text-black dark:text-white">
              {githubStats.totalForks.toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-black/55 dark:text-white/55">{aboutText.forks}</p>
          </div>
          <div className="rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-5 dark:border-white/6 dark:bg-white/[0.02]">
            <div className="text-3xl font-semibold tracking-tight text-black dark:text-white">
              {githubStats.contributions.toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-black/55 dark:text-white/55">{aboutText.contributions}</p>
          </div>
        </section>
      )}

      <div className="space-y-16">
        <section>
          <h2 className="mb-4 text-2xl font-medium text-black md:text-3xl dark:text-white">
            {aboutText.focusTitle}
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-black/65 dark:text-white/65">
            {localizedSiteConfig.about.intro}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {localizedSiteConfig.about.focus.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-4 text-sm text-black/75 dark:border-white/6 dark:bg-white/[0.02] dark:text-white/75"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-medium text-black md:text-3xl dark:text-white">
            {aboutText.techTitle}
          </h2>
          <div className="grid gap-x-16 gap-y-9 md:grid-cols-2">
            {localizedSiteConfig.about.techStackGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-base font-semibold text-black/85 dark:text-white/85">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-black/[0.04] px-3 py-1.5 text-sm text-black/65 dark:bg-white/[0.06] dark:text-white/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-medium text-black md:text-3xl dark:text-white">
            {aboutText.contactTitle}
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-black/65 dark:text-white/65">
            {localizedSiteConfig.about.contactText}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={localizedSiteConfig.socials.email}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              <Mail className="h-4 w-4" />
              {aboutText.emailAction}
            </a>
            {localizedSiteConfig.socials.github && (
              <a
                href={localizedSiteConfig.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.04]"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
