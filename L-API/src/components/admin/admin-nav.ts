import {
  Boxes,
  LayoutDashboard,
  type LucideIcon,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: AdminNavItem[] = [
  { title: "概览", href: "/admin", icon: LayoutDashboard },
  { title: "用户管理", href: "/admin/users", icon: Users },
  { title: "API 管理", href: "/admin/apis", icon: Boxes },
  { title: "订单管理", href: "/admin/orders", icon: Receipt },
  { title: "安全策略", href: "/admin/security", icon: SlidersHorizontal },
];

export function activeAdminTitle(pathname: string): string {
  const match = [...adminNav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
    );
  return match?.title ?? "管理后台";
}

export const adminBrandIcon = ShieldCheck;
