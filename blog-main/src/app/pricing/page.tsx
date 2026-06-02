import type { Metadata } from 'next';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('合作咨询'),
  description: '如果你想聊项目合作、网站搭建或内容定制，可以从这里联系我。',
  path: '/pricing',
  keywords: ['合作咨询', '项目合作', '网站搭建', '内容定制'],
});

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-24">
      <header className="mb-12 sm:mb-16">
        <h1 className="mb-3 text-3xl font-medium tracking-tight text-black sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
          合作咨询
        </h1>
        <p className="mb-6 max-w-3xl text-base leading-relaxed text-black/60 sm:text-lg dark:text-white/60">
          如果你想聊网站搭建、项目开发、设计支持或内容合作，欢迎通过下面的方式联系我，我会尽快回复并一起确认需求与方案。
        </p>
        <div className="h-[2px] w-12 bg-black sm:w-16 dark:bg-white" />
      </header>

      <section className="space-y-6 rounded-3xl border border-black/6 bg-black/[0.02] p-6 sm:p-8 dark:border-white/6 dark:bg-white/[0.02]">
        <div>
          <h2 className="text-2xl font-medium text-black dark:text-white">合作方式</h2>
          <p className="mt-3 text-base leading-relaxed text-black/60 dark:text-white/60">
            目前以邮件沟通为主：说明你的项目背景、想实现的目标和大致时间，我会结合需求给出可行方案与报价建议。
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href={siteConfig.socials.email}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            发邮件联系
          </a>
          {siteConfig.socials.github && (
            <a
              href={siteConfig.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:text-white dark:hover:bg-white/[0.04]"
            >
              查看 GitHub
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
