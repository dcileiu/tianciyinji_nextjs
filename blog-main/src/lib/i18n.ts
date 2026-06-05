import enMessages from '@/locales/en.json';
import zhMessages from '@/locales/zh-CN.json';
import type { NavItem } from './types';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const locales = ['zh-CN', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';

type LocaleMessages = typeof zhMessages;

export function normalizeLocale(value?: string | null): Locale {
  return value === 'en' ? 'en' : defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

export function getPathLocale(pathname: string) {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : defaultLocale;
}

export function localizePath(pathname: string, locale: Locale) {
  const cleanPath = stripLocalePrefix(pathname);
  if (locale === defaultLocale) return cleanPath;
  return cleanPath === '/' ? '/en' : `/en${cleanPath}`;
}

export function localizedHref(href: string, locale: Locale) {
  if (/^(https?:|mailto:|#)/i.test(href)) return href;
  return localizePath(href, locale);
}

const common = {
  name: '刘典赐的工具箱',
  title: '刘典赐的工具箱',
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://itianci.cn',
  avatar: '/avatar/avatar.webp',
  email: 'dcileiu@outlook.com',
  githubUsername: 'tianci',
  socials: {
    github: 'https://github.com/dcileiu',
    email: 'mailto:dcileiu@outlook.com',
    rss: '/rss',
  },
} as const;

const localeMessages: Record<Locale, LocaleMessages> = {
  'zh-CN': zhMessages,
  en: enMessages,
};

function buildDictionary(messages: LocaleMessages) {
  return {
    ...messages,
    site: {
      ...common,
      ...messages.site,
    },
    nav: messages.nav as NavItem[],
  };
}

export const dictionaries = {
  'zh-CN': buildDictionary(localeMessages['zh-CN']),
  en: buildDictionary(localeMessages.en),
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getLocalizedSiteConfig(locale: Locale) {
  const dictionary = getDictionary(locale);

  return {
    ...dictionary.site,
    language: dictionary.language,
    locale: dictionary.locale,
    home: {
      eyebrow: dictionary.home.eyebrow,
      title: dictionary.site.description,
      intro: dictionary.home.intro,
    },
    about: {
      intro: dictionary.about.intro,
      focus: dictionary.about.focus,
      techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Vue', 'uni-app', 'Python', 'AI Tools'],
      contactText: dictionary.about.contactText,
    },
  };
}
