'use client';

import { Check, Languages } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { SimpleDropdown, SimpleDropdownItem } from '@/components/ui/simple-dropdown';
import { localizePath, LOCALE_COOKIE, type Locale } from '@/lib/i18n';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

interface LanguageSwitcherProps {
  label?: string;
}

export function LanguageSwitcher({ label }: LanguageSwitcherProps) {
  const { dictionary, locale } = useI18n();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const ariaLabel = label ?? dictionary.header.language;

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    triggerHaptic(HapticFeedback.Light);
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    const queryString = searchParams.toString();
    const targetPath = localizePath(pathname, nextLocale);
    const targetHref = `${targetPath}${queryString ? `?${queryString}` : ''}` as Route;
    startTransition(() => {
      router.push(targetHref);
      router.refresh();
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
