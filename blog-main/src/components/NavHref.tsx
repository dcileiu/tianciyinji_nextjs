'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { isExternalHref } from '@/lib/utils';

interface NavHrefProps {
  href: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}

export function NavHref({ href, className, onClick, children }: NavHrefProps) {
  const { localizedHref } = useI18n();

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={localizedHref(href) as any} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
