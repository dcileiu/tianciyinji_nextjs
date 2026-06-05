import { Activity, CalendarDays, Coins, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { PageHeading } from "@/components/dashboard/page-heading";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { getOverviewStats, getRequestTrend, getTopApis } from "@/server/services/usage";
import { requireUser } from "@/server/services/user";

export const metadata: Metadata = { title: "用量统计" };

export default async function UsagePage() {
  const user = await requireUser();
  const [stats, trend, topApis] = await Promise.all([
    getOverviewStats(user.id),
    getRequestTrend(user.id, 14),
    getTopApis(user.id, 8),
  ]);

  const max = Math.max(1, ...topApis.map((a) => a.requests));

  return (
    <div>
      <PageHeading title="用量统计" description="查看你的接口调用趋势与分布。" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="本周请求" value={formatNumber(stats.weekRequests)} icon={Activity} />
        <StatCard label="今日请求" value={formatNumber(stats.todayRequests)} icon={CalendarDays} />
        <StatCard label="积分余额" value={formatNumber(user.credits)} icon={Coins} />
        <StatCard label="活跃密钥" value={formatNumber(stats.activeKeys)} icon={KeyRound} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="px-6">
            <h2 className="font-heading text-base font-semibold">请求趋势</h2>
            <p className="text-sm text-muted-foreground">最近 14 天</p>
          </div>
          <div className="px-2 pt-2">
            <TrendChart data={trend} className="h-72 w-full" />
          </div>
        </Card>

        <Card className="gap-0 p-6">
          <h2 className="font-heading text-base font-semibold">接口分布</h2>
          <p className="text-sm text-muted-foreground">最近 7 天 Top 接口</p>
          <div className="mt-5 space-y-4">
            {topApis.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">暂无数据</p>
            ) : (
              topApis.map((api) => (
                <div key={api.slug}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{api.name}</span>
                    <span className="text-muted-foreground">{formatNumber(api.requests)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round((api.requests / max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
