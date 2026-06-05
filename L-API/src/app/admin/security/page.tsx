import type { Metadata } from "next";
import { BanManager } from "@/components/admin/ban-manager";
import { type AbuseRow, PolicyEditor, type ThroughputRow } from "@/components/admin/policy-editor";
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
import { formatDateTime } from "@/lib/format";
import { POLICY_LABELS } from "@/lib/rate-policies";
import { rateStoreKind } from "@/server/security";
import { loadPolicies } from "@/server/security/settings";
import { listAllSecurityEvents } from "@/server/services/admin";
import { requireAdmin } from "@/server/services/user";

export const metadata: Metadata = { title: "安全策略" };

const EVENT_LABELS: Record<string, { label: string; className: string }> = {
  RATE_LIMIT: {
    label: "触发限流",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  QUOTA: { label: "配额超限", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  BAN: { label: "封禁", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  UNBAN: { label: "解封", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  LOGIN_LOCK: { label: "登录锁定", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  ABUSE: { label: "滥用风控", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  POLICY: { label: "策略变更", className: "bg-primary/15 text-primary" },
};

export default async function AdminSecurityPage() {
  await requireAdmin();
  const policies = await loadPolicies();
  const events = await listAllSecurityEvents(80);
  const store = rateStoreKind();

  const throughput: ThroughputRow[] = Object.entries(policies.throughput).map(([key, cfg]) => ({
    key,
    name: POLICY_LABELS[key as keyof typeof POLICY_LABELS]?.name ?? key,
    desc: POLICY_LABELS[key as keyof typeof POLICY_LABELS]?.desc ?? "",
    limit: cfg.limit,
    windowSec: Math.round(cfg.windowMs / 1000),
    enabled: cfg.enabled,
  }));

  const abuse: AbuseRow[] = Object.entries(policies.abuse).map(([key, cfg]) => ({
    key,
    name: POLICY_LABELS[key as keyof typeof POLICY_LABELS]?.name ?? key,
    desc: POLICY_LABELS[key as keyof typeof POLICY_LABELS]?.desc ?? "",
    threshold: cfg.threshold,
    windowSec: Math.round(cfg.windowMs / 1000),
    banMin: Math.round(cfg.banMs / 60000),
    enabled: cfg.enabled,
  }));

  return (
    <div className="space-y-8">
      <PageHeading title="安全策略" description="实时调整限流阈值、风控规则，并手动封禁/解封" />

      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-sm">
        <Badge variant="secondary" className="bg-primary/15 text-primary">
          {store === "redis" ? "Redis 分布式计数" : "内存计数（单实例）"}
        </Badge>
        <span className="text-muted-foreground">
          保存后本实例立即生效；多实例部署最长 30 秒内全部生效。
        </span>
      </div>

      <PolicyEditor throughput={throughput} abuse={abuse} />

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">手动封禁 / 解封</h2>
        <BanManager />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">全局安全事件</h2>
        <div className="rounded-2xl border border-border/70 bg-card">
          {events.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">暂无安全事件</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>范围</TableHead>
                  <TableHead>标识</TableHead>
                  <TableHead>详情</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const meta = EVENT_LABELS[event.type] ?? {
                    label: event.type,
                    className: "bg-muted text-muted-foreground",
                  };
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(event.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={meta.className}>
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {event.scope}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate font-mono text-xs text-muted-foreground">
                        {event.identifier}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{event.detail ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
