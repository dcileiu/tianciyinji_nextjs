'use client';

import { Check, Languages } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { SimpleDropdown, SimpleDropdownItem } from '@/components/ui/simple-dropdown';
import { localizePath, locales, LOCALE_COOKIE, type Locale } from '@/lib/i18n';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

interface LanguageSwitcherProps {
  label?: string;
}

export function LanguageSwitcher({ label }: LanguageSwitcherProps) {
  const { dictionary, locale } = useI18n();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const ariaLabel = label ?? dictionary.header.language;

  // 预取其它语言版本的当前页，切换时服务端内容也能秒出（而非现拉 RSC）
  useEffect(() => {
    for (const target of locales) {
      if (target === locale) continue;
      router.prefetch(localizePath(pathname, target) as Route);
    }
  }, [pathname, locale, router]);

  const handleSelect = (nextLocale: Locale) => {
    triggerHaptic(HapticFeedback.Light);
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

    if (nextLocale === locale) return;

    // locale 现在是真正的路由段（/ 对应 [locale]=zh-CN，/en 对应 [locale]=en），
    // 软导航到另一语言会命中不同的段树，服务端内容随之整体切换，无需 router.refresh()。
    // 直接在点击时读取 location.search 保留查询串，避免使用 useSearchParams（其会阻止页面静态预渲染）。
    const queryString = typeof window !== 'undefined' ? window.location.search : '';
    const targetPath = localizePath(pathname, nextLocale);
    const targetHref = `${targetPath}${queryString}` as Route;
    startTransition(() => {
      router.push(targetHref);
    });
  };

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      aria-label={ariaLabel}
      disabled={isPending}
      title={ariaLabel}
      className="rounded-full text-[#75689e] dark:text-[#ae9fda] hover:bg-[#ece5ff] dark:hover:bg-[#231c38] hover:text-[#4f31d7] dark:hover:text-[#f3efff] h-8 px-2 md:h-8 flex items-center gap-1.5"
    >
      <Languages className="h-4 w-4 md:h-4 md:w-4" />
      <span className="text-xs font-medium hidden sm:inline">{locale === 'en' ? 'English' : '简体中文'}</span>
      <span className="text-xs font-medium sm:hidden">{locale === 'en' ? 'EN' : '中'}</span>
    </Button>
  );

  return (
    <SimpleDropdown trigger={trigger} align="end">
      <SimpleDropdownItem active={locale === 'zh-CN'} onClick={() => handleSelect('zh-CN')}>
        <span className="text-xs font-medium">简体中文</span>
        {locale === 'zh-CN' && <Check className="ml-2 h-3.5 w-3.5 text-[#4f31d7] dark:text-[#f3efff]" />}
      </SimpleDropdownItem>
      <SimpleDropdownItem active={locale === 'en'} onClick={() => handleSelect('en')}>
        <span className="text-xs font-medium">English</span>
        {locale === 'en' && <Check className="ml-2 h-3.5 w-3.5 text-[#4f31d7] dark:text-[#f3efff]" />}
      </SimpleDropdownItem>
    </SimpleDropdown>
  );
}
