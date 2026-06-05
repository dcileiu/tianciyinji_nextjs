import Link from "next/link";
import { cn } from "@/lib/utils";

/** L 形 Logo 标记，使用 currentColor 以适配主题。 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={cn("size-6 text-primary", className)}
    >
      <path d="M34 14H62L54 70H26L34 14Z" fill="currentColor" />
      <path d="M54 58H84L80 82H50L54 58Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  withWordmark = true,
}: {
  href?: string;
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-heading", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
        <LogoMark className="size-5" />
      </span>
      {withWordmark && <span className="text-base font-semibold tracking-tight">L-API</span>}
    </Link>
  );
}
