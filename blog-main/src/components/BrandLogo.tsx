interface BrandLogoProps {
  className?: string;
  decorative?: boolean;
  title?: string;
}

export default function BrandLogo({ className, decorative = false, title = 'L logo' }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      role={decorative ? undefined : 'img'}
    >
      <path d="M34 14H62L54 70H26L34 14Z" fill="currentColor" />
      <path d="M54 58H84L80 82H50L54 58Z" fill="currentColor" />
    </svg>
  );
}
