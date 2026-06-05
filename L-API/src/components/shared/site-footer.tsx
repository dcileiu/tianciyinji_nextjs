import Link from "next/link";
import { LogoMark } from "@/components/shared/logo";
import { mainNav, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
              <LogoMark className="size-5" />
            </span>
            <span className="font-heading text-base font-semibold">{siteConfig.name}</span>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">产品</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">账户</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="transition-colors hover:text-foreground">
                登录
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-foreground">
                注册
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="transition-colors hover:text-foreground">
                控制台
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {siteConfig.name}. 免费、稳定、快速的公共 API 平台。
        </div>
      </div>
    </footer>
  );
}
