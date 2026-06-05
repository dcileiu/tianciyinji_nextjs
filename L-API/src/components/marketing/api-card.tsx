import { Coins, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { type ApiListItem, methodBadgeClass, STATUS_LABELS } from "@/lib/api-view";
import { cn } from "@/lib/utils";

export function ApiCard({ api }: { api: ApiListItem }) {
  return (
    <Link href={`/apis/${api.slug}`} className="group block h-full">
      <Card className="h-full gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold",
              methodBadgeClass(api.method),
            )}
          >
            {api.method}
          </span>
          <span className="truncate text-xs text-muted-foreground">{api.category.name}</span>
          {api.status !== "ACTIVE" && (
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {STATUS_LABELS[api.status]}
            </Badge>
          )}
        </div>

        <h3 className="line-clamp-1 font-heading text-base font-semibold transition-colors group-hover:text-primary">
          {api.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{api.summary}</p>

        <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-3.5" />
            {formatNumber(api.popularity)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Coins className="size-3.5" />
            {api.pricePerCall} 积分/次
          </span>
        </div>
      </Card>
    </Link>
  );
}
