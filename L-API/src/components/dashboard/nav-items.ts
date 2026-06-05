import {
  BarChart3,
  Bell,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const dashboardNav: DashboardNavItem[] = [
  { title: "概览", href: "/dashboard", icon: LayoutDashboard },
  { title: "请求日志", href: "/dashboard/logs", icon: ScrollText },
  { title: "API 密钥", href: "/dashboard/keys", icon: KeyRound },
  { title: "用量统计", href: "/dashboard/usage", icon: BarChart3 },
  { title: "账单", href: "/dashboard/billing", icon: Wallet },
  { title: "热榜订阅", href: "/dashboard/subscriptions", icon: Bell },
  { title: "安全中心", href: "/dashboard/security", icon: ShieldCheck },
];

export function activeNavTitle(pathname: string): string {
  const match = [...dashboardNav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href),
    );
  return match?.title ?? "控制台";
}
