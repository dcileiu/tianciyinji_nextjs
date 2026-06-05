"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ApiCard } from "@/components/marketing/api-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { type ApiListItem, methodBadgeClass } from "@/lib/api-view";
import { cn } from "@/lib/utils";

interface Category {
  slug: string;
  name: string;
}

export function ApiGrid({ items, categories }: { items: ApiListItem[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchCategory = activeCategory === "all" || item.category.slug === activeCategory;
      const matchQuery =
        q === "" || `${item.name} ${item.summary} ${item.slug}`.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [items, query, activeCategory]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索接口名称、描述…"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-1 self-end rounded-lg border border-border/70 p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="网格视图"
            onClick={() => setView("grid")}
          >
            <LayoutGrid />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="列表视图"
            onClick={() => setView("list")}
          >
            <List />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
          全部
        </CategoryChip>
        {categories.map((c) => (
          <CategoryChip
            key={c.slug}
            active={activeCategory === c.slug}
            onClick={() => setActiveCategory(c.slug)}
          >
            {c.name}
          </CategoryChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 py-16 text-center text-sm text-muted-foreground">
          没有找到匹配的接口
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((api) => (
            <ApiCard key={api.id} api={api} />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
          {filtered.map((api) => (
            <Link
              key={api.id}
              href={`/apis/${api.slug}`}
              className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50"
            >
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold",
                  methodBadgeClass(api.method),
                )}
              >
                {api.method}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{api.name}</p>
                <p className="truncate text-xs text-muted-foreground">{api.summary}</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {formatNumber(api.popularity)} 次
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
