import { ArrowLeft } from 'lucide-react';
import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeCopyButton } from '@/components/CodeCopyButton';
import { CopyUrlButton } from '@/components/CopyUrlButton';
import { ImagePreview } from '@/components/ImagePreview';
import JsonLd from '@/components/JsonLd';
import { LinkPreviewProvider } from '@/components/LinkPreviewProvider';
import PostNavigator from '@/components/PostNavigator';
import { getDictionary, localizedHref } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import { resolveAuthorProfile } from '@/utils/author-profile';
import { extractHeadings } from '@/utils/markdown';
import { verifyPostPassword } from '@/utils/post-encryption';
import { getAllBlogPosts, getPostBySlug } from '@/utils/posts';
import { calculateReadingTime } from '@/utils/readingTime';

export const revalidate = 30;

interface PageProps {
  params:
    | Promise<{
        slug: string;
      }>
    | {
        slug: string;
      };
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

function formatDate(dateString: string, locale: 'zh-CN' | 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const currentYear = now.getFullYear();

  if (locale === 'en') {
    if (diffDays === 0) return 'Written today';
    if (diffDays === 1) return 'Written yesterday';
    if (diffDays < 7) return `Written ${diffDays} days ago`;
    return `Written on ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  if (diffDays === 0) return '写于今天';
  if (diffDays === 1) return '写于昨天';
  if (diffDays < 7) return `写于${diffDays}天前`;
  if (year === currentYear) return `写于${month}月${day}日`;
  if (year === currentYear - 1) return `写于去年${month}月${day}日`;
  return `写于${year}年${month}月${day}日`;
}

function extractEncryptParam(value?: string | string[]): string {
  if (!value) return '';
  if (Array.isArray(value)) return value[0] || '';
  return value;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const resolvedParams = await Promise.resolve(params);
  const post = await getPostBySlug(resolvedParams.slug, 'content');

  if (!post) {
    return {
      title: pageTitle(locale === 'en' ? 'Post not found' : '文章未找到'),
      description: locale === 'en' ? 'Please check whether the link is correct.' : '请检查链接是否正确。',
    };
  }

  const description = post.excerpt || '一篇记录思考与项目进展的文章。';
  const authorProfile = resolveAuthorProfile(post.author, post.authorAvatar);

  return buildPageMetadata({
    title: pageTitle(post.title),
    description,
    path: `/post/${post.slug}`,
    type: 'article',
    image: post.coverImage || undefined,
    publishedTime: post.date,
    modifiedTime: post.date,
    authors: [authorProfile.name],
    section: post.category,
    keywords: [...(post.tags || []), post.category || (locale === 'en' ? 'Post' : '文章'), locale === 'en' ? 'Blog' : '博客'],
    noIndex: Boolean(post.encrypted),
    locale,
  });
}

export const viewport: Viewport = {
  themeColor: 'light',
} as const;

export default async function PostPage({ params, searchParams }: PageProps) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const post = await getPostBySlug(resolvedParams.slug, 'content');

  if (!post) {
    notFound();
  }

  const encryptParam = extractEncryptParam(resolvedSearchParams?.encrypt);
  const isEncrypted = Boolean(post.encrypted && post.encryption?.hash);
  let authorized = true;

  if (isEncrypted) {
    if (!encryptParam) {
      authorized = false;
    } else if (!verifyPostPassword(post.slug, encryptParam, post.encryption!.hash)) {
      authorized = false;
    }
  }

  if (isEncrypted && !authorized) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const headings = extractHeadings(post.content);
  const authorProfile = resolveAuthorProfile(post.author, post.authorAvatar);
  const articleDescription = post.excerpt || '一篇记录思考与项目进展的文章。';

  return (
    <>
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: post.title,
            description: articleDescription,
            path: localizedHref(`/post/${post.slug}`, locale),
            publishedTime: post.date,
            modifiedTime: post.date,
            image: post.coverImage || siteConfig.avatar,
            keywords: post.tags || [],
            authorName: authorProfile.name,
            locale,
            section: post.category,
            wordCount: post.wordCount,
          }),
          buildBreadcrumbJsonLd([
            { name: dictionary.about.breadcrumbs.home, path: localizedHref('/', locale) },
            { name: dictionary.archive.title, path: localizedHref('/archive', locale) },
            { name: post.title, path: localizedHref(`/post/${post.slug}`, locale) },
          ]),
        ]}
      />
      <article className="mx-auto w-full px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <nav className="mx-auto mb-8 flex max-w-5xl items-center justify-center gap-2 text-xs text-black/40 sm:mb-12 sm:text-sm dark:text-white/40">
          <Link
            href={localizedHref('/', locale) as any}
            className="inline-flex flex-shrink-0 items-center gap-1 hover:text-black sm:gap-1.5 dark:hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>{locale === 'en' ? 'Back home' : '返回首页'}</span>
          </Link>
          <span className="flex-shrink-0">/</span>
          <span className="max-w-[200px] truncate text-black/60 sm:max-w-xs md:max-w-md dark:text-white/60">
            {post.title}
          </span>
        </nav>

        <header className="mx-auto mb-12 max-w-4xl text-center sm:mb-16">
          <h1 className="mb-4 px-2 text-2xl font-medium leading-tight tracking-tight text-black sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
            {post.title}
          </h1>

          <div className="mb-4 flex items-center justify-center gap-2 sm:mb-6">
            <Image
              src={authorProfile.avatar}
              alt={`${authorProfile.name} avatar`}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span className="text-sm text-black/50 dark:text-white/50">{authorProfile.name}</span>
          </div>

          <div className="mx-auto h-[2px] w-12 bg-black sm:w-16 dark:bg-white" />
        </header>

        <LinkPreviewProvider>
          <div className="article-content-width mx-auto">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 pt-2 text-xs sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
              <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-4">
                <div className="flex items-center gap-1.5 text-black/40 dark:text-white/40">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="flex-shrink-0 text-black/40 dark:text-white/40 sm:h-4 sm:w-4"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.35066 2.06247C5.96369 1.78847 6.62701 1.60666 7.32351 1.53473L7.16943 0.0426636C6.31208 0.1312 5.49436 0.355227 4.73858 0.693033L5.35066 2.06247ZM8.67651 1.53473C11.9481 1.87258 14.5 4.63876 14.5 8.00001C14.5 11.5899 11.5899 14.5 8.00001 14.5C4.63901 14.5 1.87298 11.9485 1.5348 8.67722L0.0427551 8.83147C0.459163 12.8594 3.86234 16 8.00001 16C12.4183 16 16 12.4183 16 8.00001C16 3.86204 12.8589 0.458666 8.83059 0.0426636L8.67651 1.53473ZM2.73972 4.18084C3.14144 3.62861 3.62803 3.14195 4.18021 2.74018L3.29768 1.52727C2.61875 2.02128 2.02064 2.61945 1.52671 3.29845L2.73972 4.18084ZM1.5348 7.32279C1.60678 6.62656 1.78856 5.96348 2.06247 5.35066L0.693033 4.73858C0.355343 5.4941 0.131354 6.31152 0.0427551 7.16854L1.5348 7.32279ZM8.75001 4.75V4H7.25001V4.75V7.875C7.25001 8.18976 7.3982 8.48615 7.65001 8.675L9.55001 10.1L10.15 10.55L11.05 9.35L10.45 8.9L8.75001 7.625V4.75Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="whitespace-nowrap">
                    {locale === 'en' ? `${readingTime} min read` : `${readingTime} 分钟阅读`}
                  </span>
                </div>
                <CopyUrlButton />
              </div>

              <time className="whitespace-nowrap text-black/40 dark:text-white/40">{formatDate(post.date, locale)}</time>
            </div>

            <div
              className="prose markdown-body max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <CodeCopyButton />
          </div>
        </LinkPreviewProvider>

        <PostNavigator headings={headings} />
        <ImagePreview />
      </article>
    </>
  );
}

export async function generateStaticParams() {
  try {
    const posts = await getAllBlogPosts();
    return posts
      .filter((post) => post?.slug && typeof post.slug === 'string' && post.slug.trim().length > 0)
      .map((post) => ({
        slug: post.slug!,
      }));
  } catch (error) {
    console.error('[generateStaticParams] Error:', error);
    return [];
  }
}
