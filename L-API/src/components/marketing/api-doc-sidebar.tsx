import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ApiListItem } from "@/lib/api-view";
import { methodBadgeClass } from "@/lib/api-view";
import { cn } from "@/lib/utils";

export function ApiDocSidebar({ apis, currentSlug }: { apis: ApiListItem[]; currentSlug: string }) {
  const groups = new Map<string, ApiListItem[]>();
  for (const api of apis) {
    const list = groups.get(api.category.name) ?? [];
    list.push(api);
    groups.set(api.category.name, list);
  }

  return (
    <nav className="space-y-6 text-sm">
      <Link
        href="/apis"
        className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40"
      >
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="size-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block font-medium">API 文档</span>
          <span className="block truncate text-xs text-muted-foreground">查看完整接口列表</span>
        </span>
        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
      </Link>

      {[...groups.entries()].map(([category, items]) => (
        <div key={category}>
          <p className="mb-1.5 px-2 text-xs font-medium tracking-wide text-muted-foreground">
            {category}
          </p>
          <ul className="space-y-0.5">
            {items.map((api) => {
              const active = api.slug === currentSlug;
              return (
                <li key={api.slug}>
                  <Link
                    href={`/apis/${api.slug}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded px-1 py-0.5 font-mono text-[9px] font-bold",
                        methodBadgeClass(api.method),
                      )}
                    >
                      {api.method}
                    </span>
                    <span className="truncate">{api.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
