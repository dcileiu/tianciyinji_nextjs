'use client';

import { useId } from 'react';

interface BrandLogoProps {
  className?: string;
  decorative?: boolean;
  title?: string;
}

export default function BrandLogo({
  className,
  decorative = false,
  title = 'Dci logo',
}: BrandLogoProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      role={decorative ? undefined : 'img'}
    >
      <defs>
        <linearGradient id={gradientId} x1="18" y1="18" x2="82" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F2EEFF" />
          <stop offset="0.28" stopColor="#CDBFFF" />
          <stop offset="0.66" stopColor="#8B6BFF" />
          <stop offset="1" stopColor="#5B3DF5" />
        </linearGradient>
      </defs>

      <g stroke={`url(#${gradientId})`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M68 20H40C27.85 20 18 29.85 18 42V54C18 66.15 27.85 76 40 76H68" />
        <path d="M35 30V66H49C58.39 66 66 58.39 66 49C66 39.61 58.39 32 49 32H35" />
      </g>

      <circle cx="74" cy="26" r="4.5" fill={`url(#${gradientId})`} />
    </svg>
  );
}
