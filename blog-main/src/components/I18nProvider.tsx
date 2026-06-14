'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  getDictionary,
  getLocalizedSiteConfig,
  getPathLocale,
  localizedHref as buildLocalizedHref,
  stripLocalePrefix,
  type Locale,
} from '@/lib/i18n';
import { sectionMeta, segmentBySectionId, toolCatalog, toolHref } from '@/lib/tools/catalog';
import type { NavItem } from '@/lib/types';

type Dictionary = ReturnType<typeof getDictionary>;
type LocalizedSiteConfig = ReturnType<typeof getLocalizedSiteConfig>;

type ReadonlyNavItem = {
  readonly label: string;
  readonly href: string;
  readonly enabled: boolean;
  readonly children?: readonly ReadonlyNavItem[];
};

interface I18nContextValue {
  cleanPathname: string;
  dictionary: Dictionary;
  locale: Locale;
  localizedHref: (href: string) => string;
  navItems: NavItem[];
  pathname: string;
  siteConfig: LocalizedSiteConfig;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function cloneNavItems(items: readonly ReadonlyNavItem[]): NavItem[] {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    enabled: item.enabled,
    children: item.children ? cloneNavItems(item.children) : undefined,
  }));
}

// 工具菜单子项改为「按分区分组」：每个分区一个标题（链接到分区页），其下列出该分区的工具独立页；
// 保留置顶的去水印入口。
function buildToolNavChildren(existingChildren: NavItem[] | undefined, dictionary: Dictionary): NavItem[] {
  const dewatermark = existingChildren?.find((child) => child.href === '/tools/dewatermark');
  const sections = dictionary.toolsPage.sections as Record<string, { title: string } | undefined>;
  const toolTitles = dictionary.toolsPage.toolTitles as Record<string, string | undefined>;
  const groups: NavItem[] = sectionMeta.map((section) => ({
    label: sections[section.id]?.title ?? section.id,
    href: `/tools/${segmentBySectionId[section.id]}`,
    enabled: true,
    children: toolCatalog
      .filter((tool) => tool.sectionId === section.id)
      .map((tool) => ({
        label: toolTitles[tool.id] ?? tool.id,
        href: toolHref(tool.id),
        enabled: true,
      })),
  }));
  return dewatermark ? [dewatermark, ...groups] : groups;
}

function injectToolChildren(items: NavItem[], dictionary: Dictionary): NavItem[] {
  return items.map((item) =>
    item.href === '/tools' ? { ...item, children: buildToolNavChildren(item.children, dictionary) } : item,
  );
}

export function I18nProvider({
  children,
  initialDictionary,
  initialLocale,
}: {
  children: ReactNode;
  initialDictionary: Dictionary;
  initialLocale: Locale;
}) {
  const pathname = usePathname() || '/';
  const cleanPathname = stripLocalePrefix(pathname);
  const locale = getPathLocale(pathname);
  const dictionary = locale === initialLocale ? initialDictionary : getDictionary(locale);
  const siteConfig = useMemo(() => getLocalizedSiteConfig(locale), [locale]);
  const navItems = useMemo(
    () => injectToolChildren(cloneNavItems(dictionary.nav), dictionary),
    [dictionary],
  );

  useEffect(() => {
    document.documentElement.lang = dictionary.language;
  }, [dictionary.language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      cleanPathname,
      dictionary,
      locale,
      localizedHref: (href) => buildLocalizedHref(href, locale),
      navItems,
      pathname,
      siteConfig,
    }),
    [cleanPathname, dictionary, locale, navItems, pathname, siteConfig]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
