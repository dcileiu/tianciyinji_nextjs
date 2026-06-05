import { CreditCard, Receipt, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import { getOrderStats, listAdminOrders } from "@/server/services/admin";
import { requireAdmin } from "@/server/services/user";

export const metadata: Metadata = { title: "订单管理" };

const STATUS_META: Record<string, { label: string; className: string }> = {
  PAID: { label: "已支付", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  PENDING: { label: "待支付", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  FAILED: { label: "失败", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const [stats, { items, total, totalPages, page: activePage }] = await Promise.all([
    getOrderStats(),
    listAdminOrders(current),
  ]);

  const cards = [
    { label: "累计收入", value: formatPrice(stats.revenueCents), icon: Wallet },
    { label: "已支付订单", value: formatNumber(stats.paidCount), icon: CreditCard },
    { label: "售出积分", value: formatNumber(stats.creditsSold), icon: Receipt },
  ];

  return (
    <div>
      <PageHeading title="订单管理" description={`共 ${total} 笔订单`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card">
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">暂无订单</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>资源包</TableHead>
                <TableHead className="text-right">积分</TableHead>
                <TableHead className="text-right">金额</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((order) => {
                const meta = STATUS_META[order.status] ?? {
                  label: order.status,
                  className: "bg-muted text-muted-foreground",
                };
                return (
                  <TableRow key={order.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.user?.email ?? order.userId}
                    </TableCell>
                    <TableCell className="font-medium">{order.package?.name ?? "—"}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(order.credits)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(order.amountCents)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={meta.className}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            第 {activePage} / {totalPages} 页
          </span>
          <div className="flex gap-2">
            <Link
              href={`/admin/orders?page=${activePage - 1}`}
              aria-disabled={activePage <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                activePage <= 1 && "pointer-events-none opacity-50",
              )}
            >
              上一页
            </Link>
            <Link
              href={`/admin/orders?page=${activePage + 1}`}
              aria-disabled={activePage >= totalPages}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                activePage >= totalPages && "pointer-events-none opacity-50",
              )}
            >
              下一页
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
