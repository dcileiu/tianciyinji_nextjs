import { Check, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatNumber, formatPrice } from "@/lib/format";
import { safe } from "@/lib/safe";
import { cn } from "@/lib/utils";
import { listPackages } from "@/server/services/billing";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "价格",
  description: "L-API 积分套餐价格，按调用计费，灵活透明，注册即送体验积分。",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const packages = await safe(() => listPackages(), []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          简单透明的定价
        </h1>
        <p className="mt-3 text-muted-foreground">
          按调用消耗积分，套餐越大越划算。注册即送 1000 积分，先用后买。
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all",
              pkg.popular
                ? "border-primary/60 shadow-lg shadow-primary/10 ring-1 ring-primary/30"
                : "border-border/60 hover:border-primary/30",
            )}
          >
            {pkg.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                <Sparkles className="size-3" />
                最受欢迎
              </Badge>
            )}
            <h2 className="font-heading text-lg font-semibold">{pkg.name}</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-heading text-3xl font-bold">{formatPrice(pkg.priceCents)}</span>
              {pkg.priceCents > 0 && <span className="text-sm text-muted-foreground">/ 次性</span>}
            </div>

            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                {formatNumber(pkg.credits)} 调用积分
              </li>
              {pkg.bonus > 0 && (
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  额外赠送 {formatNumber(pkg.bonus)} 积分
                </li>
              )}
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 text-primary" />
                全部接口通用
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-4 text-primary" />
                用量与日志统计
              </li>
            </ul>

            <Link
              href="/dashboard/billing"
              className={cn(
                buttonVariants({ variant: pkg.popular ? "default" : "outline" }),
                "mt-6 w-full",
              )}
            >
              {pkg.priceCents === 0 ? "免费领取" : "立即购买"}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        * 第一版为功能演示，购买为模拟支付，不产生真实扣费。
      </p>
    </div>
  );
}
