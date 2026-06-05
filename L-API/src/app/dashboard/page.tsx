import { Activity, ArrowRight, CalendarDays, Coins, KeyRound, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { maskApiKey } from "@/lib/api-key";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getOverviewStats, getRequestTrend, getTopApis } from "@/server/services/usage";
import { listKeys } from "@/server/services/keys";
import { requireUser } from "@/server/services/user";

export const metadata: Metadata = { title: "概览" };

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const [stats, trend, topApis, keys] = await Promise.all([
    getOverviewStats(user.id),
    getRequestTrend(user.id, 7),
    getTopApis(user.id, 5),
    listKeys(user.id),
  ]);

  const activeKey = keys.find((k) => k.status === "ACTIVE");

  return (
    <div>
      <PageHeading title="概览" description={`欢迎回来，${user.name ?? "开发者"} 👋`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="本周请求" value={formatNumber(stats.weekRequests)} icon={Activity} />
        <StatCard label="今日请求" value={formatNumber(stats.todayRequests)} icon={CalendarDays} />
        <StatCard label="积分余额" value={formatNumber(user.credits)} icon={Coins} />
        <StatCard label="活跃密钥" value={formatNumber(stats.activeKeys)} icon={KeyRound} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-6">
            <div>
              <h2 className="font-heading text-base font-semibold">请求趋势</h2>
              <p className="text-sm text-muted-foreground">最近 7 天</p>
            </div>
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
          <div className="px-2 pt-2">
            <TrendChart data={trend} />
          </div>
        </Card>

        <Card className="gap-0 p-6">
          <h2 className="font-heading text-base font-semibold">热门接口</h2>
          <p className="text-sm text-muted-foreground">你最常调用的接口</p>
          <div className="mt-4 space-y-3">
            {topApis.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">暂无调用记录</p>
            ) : (
              topApis.map((api, index) => (
                <Link
                  key={api.slug}
                  href={`/apis/${api.slug}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
                >
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{api.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(api.requests)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="gap-0 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">API 密钥</h2>
            <Link
              href="/dashboard/keys"
              className="text-sm font-medium text-primary transition-colors hover:underline"
            >
              管理
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {keys.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                还没有密钥，去创建一个
              </p>
            ) : (
              keys.slice(0, 3).map((key) => (
                <div
                  key={key.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5"
                >
                  <KeyRound className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{key.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {maskApiKey(key.prefix)}
                    </p>
                  </div>
                  <Badge variant={key.status === "ACTIVE" ? "secondary" : "outline"}>
                    {key.status === "ACTIVE" ? "启用" : "已吊销"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="gap-0 p-6">
          <h2 className="font-heading text-base font-semibold">快速上手</h2>
          <p className="mt-1 text-sm text-muted-foreground">三步完成接入</p>
          <ol className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <span className="text-muted-foreground">在「API 密钥」创建一个密钥</span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <span className="text-muted-foreground">在请求头加入 x-api-key</span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <span className="text-muted-foreground">调用任意接口，用量自动记录</span>
            </li>
          </ol>
          <pre className="mt-4 overflow-auto rounded-xl bg-foreground/[0.03] p-3 font-mono text-xs ring-1 ring-border/60">
            {`curl "${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/v1/uuid?count=3" \\
  -H "x-api-key: ${activeKey ? `${activeKey.prefix}...` : "YOUR_API_KEY"}"`}
          </pre>
          <Link
            href="/apis"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-fit gap-1.5")}
          >
            浏览接口
            <ArrowRight className="size-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
