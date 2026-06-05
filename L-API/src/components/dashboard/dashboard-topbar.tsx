"use client";

import { Coins, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { activeNavTitle } from "@/components/dashboard/nav-items";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatNumber } from "@/lib/format";

export function DashboardTopbar({
  user,
  isAdmin = false,
}: {
  user: { name: string; email: string; credits: number };
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = activeNavTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/65 sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开菜单" />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader>
            <SheetTitle className="text-left">
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">控制台</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{current}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium sm:inline-flex">
          <Coins className="size-3.5 text-primary" />
          {formatNumber(user.credits)} 积分
        </span>
        <ThemeToggle />
        <UserMenu name={user.name} email={user.email} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
