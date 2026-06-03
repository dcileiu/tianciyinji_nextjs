'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/I18nProvider';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

export default function BackButton() {
  const { locale } = useI18n();
  const router = useRouter();
  const label = locale === 'en' ? 'Back' : '返回';

  return (
    <button
      onClick={() => {
        triggerHaptic(HapticFeedback.Medium);
        router.back();
      }}
      className="inline-flex items-center gap-2 text-sm text-black/40 transition-colors hover:text-black dark:text-white/40 dark:hover:text-white"
      aria-label={locale === 'en' ? 'Go back to previous page' : '返回上一页'}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
