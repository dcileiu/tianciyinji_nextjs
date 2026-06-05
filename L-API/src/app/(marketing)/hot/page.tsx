import { Bell, Flame, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { safe } from "@/lib/safe";
import { cn } from "@/lib/utils";
import { getTodayHot } from "@/server/services/hot";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "每日热榜",
  description: "L-API 每日接口调用热榜，洞察最受欢迎的公共 API 与趋势变化。",
  alternates: { canonical: "/hot" },
};

export default async function HotPage() {
  const items = await safe(() => getTodayHot(), []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <header className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary">
          <Flame className="size-3.5" />
          每日更新
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          接口热榜
        </h1>
        <p className="mt-2 text-muted-foreground">按今日调用量排序，发现最受欢迎的接口。</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 py-16 text-center text-sm text-muted-foreground">
          暂无榜单数据
        </div>
      ) : (
        <ol className="overflow-hidden rounded-2xl border border-border/70 divide-y divide-border/60">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/apis/${item.api.slug}`}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-bold",
                    item.rank <= 3
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.api.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.api.summary}</p>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {formatNumber(item.calls)} 次
                </span>
                <TrendBadge trend={item.trend} />
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-6 text-center">
        <Bell className="size-6 text-primary" />
        <p className="text-sm text-muted-foreground">订阅热榜，每日获取最新接口趋势提醒。</p>
        <Link href="/dashboard/subscriptions" className={cn(buttonVariants({ size: "sm" }))}>
          前往订阅
        </Link>
      </div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <span className="inline-flex w-14 items-center justify-end gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-3.5" />
        {trend}%
      </span>
    );
  }
  if (trend < 0) {
    return (
      <span className="inline-flex w-14 items-center justify-end gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
        <TrendingDown className="size-3.5" />
        {Math.abs(trend)}%
      </span>
    );
  }
  return (
    <span className="inline-flex w-14 items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="size-3.5" />
    </span>
  );
}
