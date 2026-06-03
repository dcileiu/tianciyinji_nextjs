'use client';

import { Languages } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { localizePath, LOCALE_COOKIE, type Locale } from '@/lib/i18n';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale: Locale = locale === 'en' ? 'zh-CN' : 'en';

  const handleToggle = () => {
    triggerHaptic(HapticFeedback.Light);
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(localizePath(pathname, nextLocale) as Route);
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={handleToggle}
      className="rounded-full text-[#75689e] dark:text-[#ae9fda] hover:bg-[#ece5ff] dark:hover:bg-[#231c38] hover:text-[#4f31d7] dark:hover:text-[#f3efff] h-8 min-w-8 px-2 md:h-8"
    >
      <Languages className="h-4 w-4 md:h-4 md:w-4" />
      <span className="ml-1 text-xs font-medium">{locale === 'en' ? '中' : 'EN'}</span>
    </Button>
  );
}
