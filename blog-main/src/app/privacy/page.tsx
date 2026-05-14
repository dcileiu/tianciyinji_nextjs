import type { Metadata } from 'next';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('隐私政策'),
  description: '关于站点如何处理访问数据和联系信息的简要说明。',
  path: '/privacy',
  keywords: ['隐私政策', '数据处理', 'Cookie'],
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
      <header className="mb-16">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-black md:text-5xl lg:text-6xl dark:text-white">
          隐私政策
        </h1>
        <p className="mb-8 text-lg text-black/50 dark:text-white/50">最后更新：2026-05-06</p>
        <div className="h-[2px] w-16 bg-black dark:bg-white" />
      </header>

      <div className="space-y-8 text-base leading-relaxed text-black/80 dark:text-white/80">
        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">基础说明</h2>
          <p>
            这是一个个人站点，主要用于发布博客、展示作品和整理资源。站点不会主动收集与你身份直接相关的敏感信息，也不会把你的数据出售给第三方。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">访问数据</h2>
          <p>
            和大多数网站一样，服务器可能会记录基础访问数据，例如访问时间、请求路径、浏览器类型和 IP
            地址。这些信息仅用于排查问题、了解访问情况和优化站点体验。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">本地存储与偏好</h2>
          <p>
            为了记住主题、布局和侧边栏等界面偏好，站点会在你的浏览器本地存储少量配置。这些内容仅保存在你的设备中，用于改善浏览体验。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">第三方服务</h2>
          <p>
            某些页面可能会使用第三方资源，例如图片、字体、代码仓库数据或外部链接预览。当你访问这些内容时，相关服务提供方可能会按照它们自己的隐私政策处理请求数据。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-black dark:text-white">联系我</h2>
          <p>如果你通过邮件联系我，我只会将这些信息用于回复你的问题或继续沟通，不会用于营销或向第三方披露。</p>
          <div className="mt-6 rounded-xl border border-black/[0.06] bg-black/[0.02] p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <p className="mb-2 text-sm text-black/60 dark:text-white/60">邮箱</p>
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
