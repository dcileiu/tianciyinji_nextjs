import type { ApiWithCategory } from "@/server/services/apis";

export type ApiStatus = "ACTIVE" | "BETA" | "DEPRECATED";

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiListItem {
  id: string;
  slug: string;
  name: string;
  summary: string;
  method: string;
  pricePerCall: number;
  popularity: number;
  status: ApiStatus;
  featured: boolean;
  category: { slug: string; name: string };
}

export function toApiListItem(api: ApiWithCategory): ApiListItem {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    summary: api.summary,
    method: api.method,
    pricePerCall: api.pricePerCall,
    popularity: api.popularity,
    status: api.status,
    featured: api.featured,
    category: { slug: api.category.slug, name: api.category.name },
  };
}

export const STATUS_LABELS: Record<ApiStatus, string> = {
  ACTIVE: "可用",
  BETA: "测试",
  DEPRECATED: "下线",
};

export function methodBadgeClass(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400";
    case "POST":
      return "bg-sky-500/12 text-sky-600 dark:text-sky-400";
    case "PUT":
      return "bg-amber-500/12 text-amber-600 dark:text-amber-400";
    case "DELETE":
      return "bg-rose-500/12 text-rose-600 dark:text-rose-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function parseApiParams(params: unknown): ApiParam[] {
  if (!Array.isArray(params)) return [];
  return params.filter(
    (p): p is ApiParam => typeof p === "object" && p !== null && "name" in p && "type" in p,
  );
}
