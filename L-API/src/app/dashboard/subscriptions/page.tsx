import { Bell, Flame } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/dashboard/page-heading";
import { SubscriptionToggle } from "@/components/dashboard/subscription-toggle";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { getSubscription, getTodayHot } from "@/server/services/hot";
import { requireUser } from "@/server/services/user";

export const metadata: Metadata = { title: "热榜订阅" };

export default async function SubscriptionsPage() {
  const user = await requireUser();
  const [subscription, hot] = await Promise.all([getSubscription(user.id), getTodayHot()]);
  const subscribed = Boolean(subscription);

  return (
    <div>
      <PageHeading title="热榜订阅" description="订阅每日接口热榜，掌握最新调用趋势。" />

      <Card className="mb-8 flex-row items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold">每日热榜推送</h2>
            <p className="text-sm text-muted-foreground">
              {subscribed ? "已开启，将每日推送热门接口榜单。" : "开启后，每日推送热门接口榜单。"}
            </p>
          </div>
        </div>
        <SubscriptionToggle initialSubscribed={subscribed} />
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">今日热榜预览</h2>
        <Link href="/hot" className="text-sm font-medium text-primary hover:underline">
          查看完整榜单
        </Link>
      </div>
      <Card className="gap-0 p-2">
        {hot.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">暂无榜单数据</div>
        ) : (
          <ol className="divide-y divide-border/60">
            {hot.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/apis/${item.api.slug}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {item.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {item.api.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="size-3.5" />
                    {formatNumber(item.calls)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
