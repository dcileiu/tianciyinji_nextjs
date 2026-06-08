import { CheckCircle2, Coins, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { BuyCredits } from "@/components/dashboard/buy-credits";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { enabledPaymentMethods } from "@/server/payments";
import { listOrders, listPackages } from "@/server/services/billing";
import { requireUser } from "@/server/services/user";

export const metadata: Metadata = { title: "账单" };

const ORDER_STATUS: Record<string, string> = {
  PAID: "已支付",
  PENDING: "处理中",
  FAILED: "失败",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const user = await requireUser();
  const [{ paid }, packages, orders] = await Promise.all([
    searchParams,
    listPackages(),
    listOrders(user.id),
  ]);
  const methods = enabledPaymentMethods();

  return (
    <div>
      <PageHeading title="账单" description="管理积分余额、购买资源包与查看订单。" />

      {paid && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          支付完成后积分将在确认到账后更新，如未及时显示请稍候刷新。
        </div>
      )}

      <Card className="mb-8 gap-0 bg-gradient-to-br from-primary/10 to-transparent p-6">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="size-4 text-primary" />
          当前积分余额
        </span>
        <div className="mt-2 font-heading text-4xl font-bold tracking-tight">
          {formatNumber(user.credits)}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">积分用于按次调用接口，购买后即时到账。</p>
      </Card>

      <h2 className="mb-4 font-heading text-lg font-semibold">购买资源包</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={cn(
              "relative gap-0 p-5",
              pkg.popular && "border-primary/50 ring-1 ring-primary/20",
            )}
          >
            {pkg.popular && (
              <Badge className="absolute -top-2.5 left-5 gap-1">
                <Sparkles className="size-3" />
                推荐
              </Badge>
            )}
            <h3 className="font-heading text-base font-semibold">{pkg.name}</h3>
            <div className="mt-2 font-heading text-2xl font-bold">
              {formatPrice(pkg.priceCents)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatNumber(pkg.credits)} 积分
              {pkg.bonus > 0 && <span className="text-primary"> + {formatNumber(pkg.bonus)}</span>}
            </p>
            <div className="mt-4">
              <BuyCredits
                packageId={pkg.id}
                priceCents={pkg.priceCents}
                methods={methods}
                popular={pkg.popular}
              />
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 mb-4 font-heading text-lg font-semibold">订单记录</h2>
      <div className="rounded-2xl border border-border/70 bg-card">
        {orders.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">暂无订单</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>套餐</TableHead>
                <TableHead className="text-right">积分</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead className="text-right">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">{order.package?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">+{formatNumber(order.credits)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatPrice(order.amountCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={order.status === "PAID" ? "secondary" : "outline"}>
                      {ORDER_STATUS[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {methods.length > 0
          ? "* 支持支付宝 / 微信支付，支付完成后由支付平台异步通知到账。"
          : "* 当前未配置支付渠道，购买为模拟到账（仅用于演示）。"}
      </p>
    </div>
  );
}
