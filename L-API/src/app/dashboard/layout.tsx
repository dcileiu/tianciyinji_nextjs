import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { requireUser } from "@/server/services/user";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-svh bg-muted/20">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border/60 bg-background md:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-5">
          <Logo />
        </div>
        <div className="py-4">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          isAdmin={isAdmin}
          user={{
            name: user.name ?? "",
            email: user.email ?? "",
            credits: user.credits,
          }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
