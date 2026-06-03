import { ArrowLeft, Download, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeCopyButton } from '@/components/CodeCopyButton';
import { DesignPreview } from '@/components/DesignPreview';
import JsonLd from '@/components/JsonLd';
import { getDictionary, localizedHref } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { buildBreadcrumbJsonLd, buildCreativeWorkJsonLd, buildPageMetadata } from '@/lib/seo';
import { getResourceBySlug, getResources } from '@/utils/resources';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const resources = await getResources();
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    return {
      title: pageTitle(locale === 'en' ? 'Resource not found' : '资源未找到'),
    };
  }

  return buildPageMetadata({
    title: pageTitle(`${locale === 'en' ? 'Resource' : '资源'} / ${resource.title}`),
    description: resource.description,
    path: `/resources/${resource.slug}`,
    image: siteConfig.avatar,
    keywords: [...(resource.tags || []), resource.type, resource.format || (locale === 'en' ? 'Resource' : '资源')],
    publishedTime: resource.date,
    modifiedTime: resource.date,
    locale,
  });
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const text = getDictionary(locale).resources;
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16 md:px-6 md:py-24">
      <JsonLd
        data={[
          buildCreativeWorkJsonLd({
            title: resource.title,
            description: resource.description,
            path: `/resources/${resource.slug}`,
            publishedTime: resource.date,
            modifiedTime: resource.date,
            keywords: resource.tags,
            encodingFormat: resource.format,
            downloadUrl: resource.downloadUrl,
            image: siteConfig.avatar,
          }),
          buildBreadcrumbJsonLd([
            { name: locale === 'en' ? 'Home' : '首页', path: localizedHref('/', locale) },
            { name: text.title, path: localizedHref('/resources', locale) },
            { name: resource.title, path: localizedHref(`/resources/${resource.slug}`, locale) },
          ]),
        ]}
      />
      <Link
        href={localizedHref('/resources', locale) as any}
        className="mb-8 inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {locale === 'en' ? 'Back to resources' : '返回资源列表'}
      </Link>

      <header className="mb-12">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-medium tracking-tight text-black sm:text-4xl md:text-5xl dark:text-white">
            {resource.title}
          </h1>
          <span className="whitespace-nowrap rounded-md bg-black/[0.04] px-3 py-1 text-xs text-black/50 dark:bg-white/[0.06] dark:text-white/50">
            {resource.type}
          </span>
        </div>
        <p className="mb-6 text-base leading-relaxed text-black/60 sm:text-lg dark:text-white/60">
          {resource.description}
        </p>
        <div className="h-[2px] w-16 bg-black dark:bg-white" />
      </header>

      <div className="mb-12 rounded-lg bg-black/[0.02] px-4 py-4 sm:rounded-xl sm:px-5 sm:py-5 md:px-8 md:py-6 dark:bg-white/[0.02]">
        <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-center gap-6 sm:gap-8 md:gap-12">
            {resource.format && (
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="text-xl font-semibold tracking-tight text-black sm:text-2xl md:text-3xl dark:text-white">
                  {resource.format}
                </h4>
                <p className="whitespace-nowrap text-xs text-black/70 sm:text-xs md:text-sm dark:text-white/70">
                  {locale === 'en' ? 'Format' : '格式'}
                </p>
              </div>
            )}
            {resource.size && (
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="text-xl font-semibold tracking-tight text-black sm:text-2xl md:text-3xl dark:text-white">
                  {resource.size}
                </h4>
                <p className="whitespace-nowrap text-xs text-black/70 sm:text-xs md:text-sm dark:text-white/70">
                  {text.fileSize}
                </p>
              </div>
            )}
            {resource.lastUpdated && (
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="text-xl font-semibold tracking-tight text-black sm:text-2xl md:text-3xl dark:text-white">
                  {resource.lastUpdated}
                </h4>
                <p className="whitespace-nowrap text-xs text-black/70 sm:text-xs md:text-sm dark:text-white/70">
                  {text.updatedAt}
                </p>
              </div>
            )}
          </div>

          {resource.downloadUrl && (
            <div className="flex w-full flex-col gap-2 sm:w-auto md:w-auto md:flex-shrink-0 md:items-end">
              <a
                href={resource.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-base font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 sm:w-auto"
              >
                <Download className="h-5 w-5" />
                {text.download}
              </a>
            </div>
          )}
        </div>
      </div>

      {resource.details && Object.keys(resource.details).length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-medium text-black sm:text-2xl dark:text-white">
            {locale === 'en' ? 'Details' : '详细信息'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(resource.details).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-black/[0.06] p-4 dark:border-white/[0.06]">
                <dt className="mb-1 text-sm text-black/60 dark:text-white/60">{key}</dt>
                <dd className="text-base font-medium text-black dark:text-white">{value as string}</dd>
              </div>
            ))}
          </div>
        </section>
      )}

      {resource.sample && (
        <section className="mb-12">
          {resource.type === 'design' ? (
            <DesignPreview code={resource.sample} title={resource.title} />
          ) : (
            <>
              <h2 className="mb-6 text-xl font-medium text-black sm:text-2xl dark:text-white">
                {locale === 'en' ? 'Description' : '详细说明'}
              </h2>
              <div
                className="prose markdown-body max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: resource.sample }}
              />
              <CodeCopyButton />
            </>
          )}
        </section>
      )}

      {resource.usage && resource.usage.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-medium text-black sm:text-2xl dark:text-white">
            {locale === 'en' ? 'Use Cases' : '使用场景'}
          </h2>
          <p className="text-sm leading-relaxed text-black/60 sm:text-base dark:text-white/60">
            {resource.usage.join(locale === 'en' ? ', ' : '、')}
          </p>
        </section>
      )}

      {resource.tags && resource.tags.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-medium text-black sm:text-2xl dark:text-white">
            {locale === 'en' ? 'Tags' : '标签'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-md bg-black/[0.04] px-3 py-1.5 text-sm text-black/60 dark:bg-white/[0.06] dark:text-white/60"
              >
                <Tag className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
