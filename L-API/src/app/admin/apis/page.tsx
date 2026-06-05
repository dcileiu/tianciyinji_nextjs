import type { Metadata } from "next";
import { ApiActions } from "@/components/admin/api-actions";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { methodBadgeClass, STATUS_LABELS } from "@/lib/api-view";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { listAdminApis } from "@/server/services/admin";
import { requireAdmin } from "@/server/services/user";

export const metadata: Metadata = { title: "API 管理" };

export default async function AdminApisPage() {
  await requireAdmin();
  const apis = await listAdminApis();

  return (
    <div>
      <PageHeading
        title="API 管理"
        description={`共 ${apis.length} 个接口（可调整价格、状态与推荐）`}
      />

      <div className="rounded-2xl border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>接口</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">单价</TableHead>
              <TableHead className="text-right">热度</TableHead>
              <TableHead>推荐</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apis.map((api) => (
              <TableRow key={api.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{api.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{api.slug}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{api.category.name}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 font-mono text-xs font-semibold",
                      methodBadgeClass(api.method),
                    )}
                  >
                    {api.method}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={api.status === "ACTIVE" ? "secondary" : "outline"}>
                    {STATUS_LABELS[api.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {api.pricePerCall} 积分
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatNumber(api.popularity)}
                </TableCell>
                <TableCell>
                  {api.featured ? (
                    <Badge variant="secondary" className="bg-primary/15 text-primary">
                      精选
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <ApiActions
                    api={{
                      id: api.id,
                      name: api.name,
                      slug: api.slug,
                      summary: api.summary,
                      pricePerCall: api.pricePerCall,
                      status: api.status,
                      featured: api.featured,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
