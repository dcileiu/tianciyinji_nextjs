import { Boxes, Receipt, ShieldAlert, SlidersHorizontal, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/dashboard/page-heading";
import { formatNumber, formatPrice } from "@/lib/format";
import { safe } from "@/lib/safe";
import { getAdminOverview, getSecurityEventStats } from "@/server/services/admin";
import { requireAdmin } from "@/server/services/user";

export const metadata: Metadata = { title: "管理后台" };

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const overview = await safe(() => getAdminOverview(), {
    users: 0,
    apis: 0,
    paidOrders: 0,
    revenueCents: 0,
  });
  const events = await safe(() => getSecurityEventStats(), { total: 0, last24h: 0 });

  const cards = [
    { label: "用户总数", value: formatNumber(overview.users), icon: Users },
    { label: "接口数量", value: formatNumber(overview.apis), icon: Boxes },
    { label: "累计收入", value: formatPrice(overview.revenueCents), icon: Wallet },
    { label: "近 24h 安全事件", value: formatNumber(events.last24h), icon: ShieldAlert },
  ];

  const links = [
    {
      href: "/admin/users",
      title: "用户管理",
      desc: "查看用户、调整积分、设置角色",
      icon: Users,
    },
    { href: "/admin/apis", title: "API 管理", desc: "调整接口价格、状态与推荐", icon: Boxes },
    { href: "/admin/orders", title: "订单管理", desc: "查看订单与收入统计", icon: Receipt },
    {
      href: "/admin/security",
      title: "安全策略",
      desc: "限流/风控阈值、手动封禁、安全事件",
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div>
      <PageHeading title={`欢迎，${admin.name ?? "管理员"}`} description="平台运营与安全管理后台" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{link.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{link.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
