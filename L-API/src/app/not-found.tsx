import Link from "next/link";
import { LogoMark } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <LogoMark className="size-12" />
      <h1 className="font-heading text-3xl font-bold tracking-tight">页面走丢了</h1>
      <p className="max-w-sm text-muted-foreground">你访问的页面不存在或已被移动。</p>
      <Link href="/" className={cn(buttonVariants())}>
        返回首页
      </Link>
    </div>
  );
}
