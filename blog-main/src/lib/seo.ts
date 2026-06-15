import type { Metadata } from 'next';
import { defaultLocale, getDictionary, localizePath, type Locale } from './i18n';
import { absoluteUrl, localizedSiteNames, localizePageTitle, siteConfig, siteKeywords } from './site-config';

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  image?: string | string[];
  noIndex?: boolean;
  locale?: Locale;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type ArticleJsonLdOptions = {
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string | null;
  keywords?: string[];
  authorName?: string;
  section?: string;
  wordCount?: number;
  locale?: Locale;
};

type CreativeWorkJsonLdOptions = {
  title: string;
  description: string;
  path: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  encodingFormat?: string;
  downloadUrl?: string;
  image?: string | null;
  locale?: Locale;
};

export const defaultSocialImage = absoluteUrl('/opengraph-image');

function normalizeImage(image?: string | null) {
  if (!image) return defaultSocialImage;
  if (/^https?:\/\//i.test(image)) return image;
  return absoluteUrl(image);
}

export function getSiteSameAs() {
  return [siteConfig.socials.github].filter(Boolean);
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  type = 'website',
  image,
  noIndex = false,
  locale = defaultLocale,
  publishedTime,
  modifiedTime,
  authors,
  section,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(localizePath(path, locale));
  const socialImage = Array.isArray(image) ? image.map((item) => normalizeImage(item)) : [normalizeImage(image)];
  const mergedKeywords = Array.from(new Set([...siteKeywords, ...keywords]));
  const localizedTitle = localizePageTitle(title, locale);
  const localizedSiteName = localizedSiteNames[locale];

  return {
    title: localizedTitle,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical,
      languages: {
        'zh-CN': absoluteUrl(localizePath(path, 'zh-CN')),
        en: absoluteUrl(localizePath(path, 'en')),
        'x-default': absoluteUrl(localizePath(path, 'zh-CN')),
      },
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      title: localizedTitle,
      description,
      url: canonical,
      siteName: localizedSiteName,
      locale: locale === 'en' ? 'en_US' : siteConfig.locale,
      type,
      images: socialImage.map((url) => ({
        url,
        width: 1200,
        height: 630,
        alt: localizedTitle,
      })),
      publishedTime,
      modifiedTime,
      authors,
      section,
    },
    twitter: {
      card: 'summary_large_image',
      title: localizedTitle,
      description,
      images: socialImage,
    },
  };
}

export function buildWebSiteJsonLd(locale?: Locale) {
  const localizedSite = locale ? getDictionary(locale).site : siteConfig;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: localizedSite.name,
    alternateName: localizedSite.title,
    url: siteConfig.url,
    description: localizedSite.description,
    inLanguage: locale ?? siteConfig.language,
    publisher: {
      '@type': 'Person',
      name: localizedSite.name,
      url: siteConfig.url,
      image: absoluteUrl(siteConfig.avatar),
    },
  };
}

export function buildPersonJsonLd(locale?: Locale) {
  const localizedSite = locale ? getDictionary(locale).site : siteConfig;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: localizedSite.name,
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.avatar),
    description: localizedSite.description,
    jobTitle: localizedSite.role,
    homeLocation: {
      '@type': 'Place',
      name: localizedSite.location,
    },
    email: siteConfig.email,
    sameAs: getSiteSameAs(),
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildArticleJsonLd({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  image,
  keywords = [],
  authorName,
  section,
  wordCount,
  locale,
}: ArticleJsonLdOptions) {
  const localizedTitle = localizePageTitle(title, locale);
  const localizedSiteName = localizedSiteNames[locale ?? defaultLocale];
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: localizedTitle,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    inLanguage: locale ?? siteConfig.language,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    articleSection: section,
    keywords,
    wordCount,
    image: normalizeImage(image),
    author: {
      '@type': 'Person',
      name: authorName || localizedSiteName,
      url: siteConfig.url,
      image: absoluteUrl(siteConfig.avatar),
    },
    publisher: {
      '@type': 'Person',
      name: localizedSiteName,
      url: siteConfig.url,
      image: absoluteUrl(siteConfig.avatar),
    },
  };
}

export function buildCreativeWorkJsonLd({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  keywords = [],
  encodingFormat,
  downloadUrl,
  image,
  locale,
}: CreativeWorkJsonLdOptions) {
  const localizedTitle = localizePageTitle(title, locale);
  const localizedSiteName = localizedSiteNames[locale ?? defaultLocale];
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: localizedTitle,
    description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    inLanguage: locale ?? siteConfig.language,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    keywords,
    encodingFormat,
    image: normalizeImage(image),
    isAccessibleForFree: true,
    distribution: downloadUrl
      ? {
          '@type': 'DataDownload',
          contentUrl: downloadUrl,
          encodingFormat,
          name: title,
        }
      : undefined,
    author: {
      '@type': 'Person',
      name: localizedSiteName,
      url: siteConfig.url,
      image: absoluteUrl(siteConfig.avatar),
    },
  };
}

export function buildCollectionPageJsonLd({
  title,
  description,
  path,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
}) {
  const localizedTitle = localizePageTitle(title, locale);
  const localizedSiteName = localizedSiteNames[locale ?? defaultLocale];
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: localizedTitle,
    description,
    url: absoluteUrl(path),
    inLanguage: locale ?? siteConfig.language,
    isPartOf: {
      '@type': 'WebSite',
      name: localizedSiteName,
      url: siteConfig.url,
    },
  };
}

export function buildItemListJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
