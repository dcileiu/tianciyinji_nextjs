import { BriefcaseBusiness, Github, Mail, MapPin, Rss } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import { getGitHubStats } from '@/lib/github';
import { hasGithubProfile, pageTitle, siteConfig } from '@/lib/site-config';
import { buildBreadcrumbJsonLd, buildPageMetadata, buildPersonJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('关于'),
  description: siteConfig.about.intro,
  path: '/about',
  keywords: ['关于我', '个人介绍', '技术栈', '联系方式'],
});

export const revalidate = 3600;

export default async function AboutPage() {
  const githubStats = hasGithubProfile ? await getGitHubStats() : null;
  const socialLinks = [
    siteConfig.socials.github ? { name: 'GitHub', href: siteConfig.socials.github, icon: Github } : null,
    { name: 'RSS', href: siteConfig.socials.rss, icon: Rss },
    { name: 'Email', href: siteConfig.socials.email, icon: Mail },
  ].filter(Boolean) as Array<{ name: string; href: string; icon: typeof Github }>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <JsonLd
        data={[
          buildPersonJsonLd(),
          buildBreadcrumbJsonLd([
            { name: '首页', path: '/' },
            { name: '关于', path: '/about' },
          ]),
        ]}
      />
      <header className="mb-16 md:mb-20">
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-start md:text-left">
          <div className="mx-auto overflow-hidden rounded-full border border-black/10 md:mx-0 dark:border-white/10">
            <Image
              src={siteConfig.avatar}
              alt={siteConfig.name}
              width={112}
              height={112}
              className="h-28 w-28 object-cover"
              priority
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-medium tracking-tight text-black md:text-5xl dark:text-white">
              {siteConfig.name}
            </h1>
            <p className="mt-3 text-base text-black/60 md:text-lg dark:text-white/60">{siteConfig.tagline}</p>

            <div className="mt-5 flex flex-col items-center gap-3 text-sm text-black/55 md:flex-row md:flex-wrap dark:text-white/55">
              <span className="inline-flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4" />
                {siteConfig.role}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {siteConfig.location}
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
            <p className="mt-2 text-sm text-black/55 dark:text-white/55">项目 Forks</p>
          </div>
          <div className="rounded-2xl border border-black/6 bg-black/[0.02] px-5 py-5 dark:border-white/6 dark:bg-white/[0.02]">
            <div className="text-3xl font-semibold tracking-tight text-black dark:text-white">
              {githubStats.contributions.toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-black/55 dark:text-white/55">近一年贡献</p>
          </div>
        </section>
      )}

      <div className="space-y-16">
        <section>
          <h2 className="mb-4 text-2xl font-medium text-black md:text-3xl dark:text-white">这个站点会放什么</h2>
          <p className="max-w-3xl text-base leading-relaxed text-black/65 dark:text-white/65">
            {siteConfig.about.intro}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {siteConfig.about.focus.map((item) => (
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
          <h2 className="mb-4 text-2xl font-medium text-black md:text-3xl dark:text-white">常用技术</h2>
          <div className="flex flex-wrap gap-2">
            {siteConfig.about.techStack.map((item) => (
              <span
                key={item}
                className="rounded-full bg-black/[0.04] px-3 py-1.5 text-sm text-black/70 dark:bg-white/[0.06] dark:text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-medium text-black md:text-3xl dark:text-white">联系我</h2>
          <p className="max-w-3xl text-base leading-relaxed text-black/65 dark:text-white/65">
            {siteConfig.about.contactText}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={siteConfig.socials.email}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              <Mail className="h-4 w-4" />
              发邮件
            </a>
            {siteConfig.socials.github && (
              <a
                href={siteConfig.socials.github}
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
