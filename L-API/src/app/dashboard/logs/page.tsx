import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/dashboard/page-heading";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listLogs } from "@/server/services/usage";
import { requireUser } from "@/server/services/user";

export const metadata: Metadata = { title: "请求日志" };

function statusClass(code: number) {
  if (code >= 200 && code < 300) return "text-emerald-600 dark:text-emerald-400";
  if (code >= 400 && code < 500) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const { items, total, totalPages, page: activePage } = await listLogs(user.id, current, 20);

  return (
    <div>
      <PageHeading title="请求日志" description={`共 ${total} 条调用记录`} />

      <div className="rounded-2xl border border-border/70 bg-card">
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">暂无调用记录</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>接口</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">延迟</TableHead>
                <TableHead className="text-right">消耗</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">{log.api?.name ?? log.endpoint}</TableCell>
                  <TableCell className={cn("font-mono", statusClass(log.statusCode))}>
                    {log.statusCode}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {log.latencyMs}ms
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {log.creditsCost} 积分
                  </TableCell>
                </TableRow>
              ))}
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
              href={`/dashboard/logs?page=${activePage - 1}`}
              aria-disabled={activePage <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                activePage <= 1 && "pointer-events-none opacity-50",
              )}
            >
              上一页
            </Link>
            <Link
              href={`/dashboard/logs?page=${activePage + 1}`}
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
