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
import { toolNavMenuGroups, toolHref, type ToolNavEntry } from '@/lib/tools/catalog';
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

function resolveToolNavEntry(entry: ToolNavEntry, dictionary: Dictionary): NavItem {
  const navMenu = dictionary.toolsPage.navMenu as Record<string, string | undefined>;
  const toolTitles = dictionary.toolsPage.toolTitles as Record<string, string | undefined>;

  if (entry.kind === 'page') {
    return {
      label: navMenu[entry.labelKey] ?? entry.labelKey,
      href: entry.href,
      enabled: true,
    };
  }

  return {
    label: toolTitles[entry.id] ?? entry.id,
    href: toolHref(entry.id),
    enabled: true,
  };
}

function resolveToolNavGroupLabel(labelKey: string, dictionary: Dictionary): string {
  const navMenu = dictionary.toolsPage.navMenu as Record<string, string | undefined>;
  if (labelKey.startsWith('section.')) {
    const sectionId = labelKey.slice('section.'.length);
    const sections = dictionary.toolsPage.sections as Record<string, { title: string } | undefined>;
    return sections[sectionId]?.title ?? sectionId;
  }
  return navMenu[labelKey] ?? labelKey;
}

// 侧栏工具子菜单：精选分组 + 常用工具置顶
function buildToolNavChildren(_existingChildren: NavItem[] | undefined, dictionary: Dictionary): NavItem[] {
  return toolNavMenuGroups.map((group) => ({
    label: resolveToolNavGroupLabel(group.labelKey, dictionary),
    href: '/tools',
    enabled: true,
    children: group.entries.map((entry) => resolveToolNavEntry(entry, dictionary)),
  }));
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
