import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/dashboard/page-heading";
import { UserActions } from "@/components/admin/user-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listUsers } from "@/server/services/admin";
import { requireAdmin } from "@/server/services/user";

export const metadata: Metadata = { title: "用户管理" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const admin = await requireAdmin();
  const { page, q } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const {
    items,
    total,
    totalPages,
    page: activePage,
  } = await listUsers(current, q?.trim() || undefined);

  const qs = (p: number) => `/admin/users?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div>
      <PageHeading title="用户管理" description={`共 ${total} 名用户`} />

      <form className="mb-4 flex max-w-sm items-center gap-2" action="/admin/users">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} placeholder="搜索邮箱或昵称" className="pl-9" />
        </div>
        <button type="submit" className={cn(buttonVariants({ variant: "outline" }))}>
          搜索
        </button>
      </form>

      <div className="rounded-2xl border border-border/70 bg-card">
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">没有匹配的用户</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="text-right">积分</TableHead>
                <TableHead className="text-right">密钥</TableHead>
                <TableHead className="text-right">调用</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name || "未命名"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(user.role === "ADMIN" && "bg-primary/15 text-primary")}
                    >
                      {user.role === "ADMIN" ? "管理员" : "普通用户"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(user.credits)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {user._count.apiKeys}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(user._count.requestLogs)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions
                      isSelf={user.id === admin.id}
                      user={{
                        id: user.id,
                        name: user.name ?? "",
                        email: user.email ?? "",
                        role: user.role,
                        credits: user.credits,
                      }}
                    />
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
              href={qs(activePage - 1)}
              aria-disabled={activePage <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                activePage <= 1 && "pointer-events-none opacity-50",
              )}
            >
              上一页
            </Link>
            <Link
              href={qs(activePage + 1)}
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
