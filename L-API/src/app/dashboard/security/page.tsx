import type { Metadata } from "next";
import { ShieldAlert, ShieldCheck } from "lucide-react";
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
import { formatDateTime, formatNumber } from "@/lib/format";
import { rateStoreKind } from "@/server/security";
import { loadPolicies } from "@/server/security/settings";
import { listSecurityEvents } from "@/server/services/security";
import { requireUser } from "@/server/services/user";

export const metadata: Metadata = { title: "安全中心" };

const EVENT_LABELS: Record<string, { label: string; className: string }> = {
  RATE_LIMIT: {
    label: "触发限流",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  QUOTA: { label: "配额超限", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  BAN: { label: "临时封禁", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  LOGIN_LOCK: { label: "登录锁定", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  ABUSE: { label: "滥用风控", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
};

function perMin(windowMs: number): string {
  const sec = Math.round(windowMs / 1000);
  if (sec === 60) return "分钟";
  if (sec === 3600) return "小时";
  if (sec === 86400) return "天";
  return `${sec} 秒`;
}

export default async function SecurityPage() {
  const user = await requireUser();
  const events = await listSecurityEvents(user.id, 50);
  const store = rateStoreKind();
  const { throughput, abuse } = await loadPolicies();

  const policyRows = [
    {
      name: "单密钥调用频率",
      value: `${formatNumber(throughput.apiPerKey.limit)} 次 / ${perMin(throughput.apiPerKey.windowMs)}`,
      note: throughput.apiPerKey.enabled ? "超出返回 429，并携带 Retry-After" : "当前已关闭",
    },
    {
      name: "单 IP 调用频率",
      value: `${formatNumber(throughput.apiPerIp.limit)} 次 / ${perMin(throughput.apiPerIp.windowMs)}`,
      note: throughput.apiPerIp.enabled ? "拦截无密钥的洪泛请求" : "当前已关闭",
    },
    {
      name: "每日免费配额",
      value: `${formatNumber(throughput.dailyQuota.limit)} 次 / ${perMin(throughput.dailyQuota.windowMs)}`,
      note: throughput.dailyQuota.enabled ? "按用户维度统计" : "当前已关闭",
    },
    {
      name: "登录失败锁定",
      value: `${abuse.login.threshold} 次 / ${perMin(abuse.login.windowMs)}`,
      note: abuse.login.enabled
        ? `锁定 ${Math.round(abuse.login.banMs / 60000)} 分钟，防爆破`
        : "当前已关闭",
    },
    {
      name: "接口滥用自动封禁",
      value: `${abuse.apiKey.threshold} 次错误 / ${perMin(abuse.apiKey.windowMs)}`,
      note: abuse.apiKey.enabled
        ? `密钥临时封禁 ${Math.round(abuse.apiKey.banMs / 60000)} 分钟`
        : "当前已关闭",
    },
    {
      name: "注册频率限制",
      value: `${throughput.register.limit} 次 / ${perMin(throughput.register.windowMs)}`,
      note: throughput.register.enabled ? "按 IP 防批量注册" : "当前已关闭",
    },
  ];

  return (
    <div>
      <PageHeading title="安全中心" description="平台的限流策略、风控规则与近期安全事件" />

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div className="text-sm">
          <p className="font-medium">
            限流计数后端：{store === "redis" ? "Redis（多实例共享）" : "进程内内存（单实例）"}
          </p>
          <p className="text-muted-foreground">
            {store === "redis"
              ? "已启用分布式计数，适用于多实例 / Serverless 部署。"
              : "配置 UPSTASH_REDIS_REST_* 后将自动切换为分布式计数。"}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {policyRows.map((row) => (
          <div key={row.name} className="rounded-2xl border border-border/70 bg-card p-5">
            <p className="text-sm text-muted-foreground">{row.name}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{row.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{row.note}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">近期安全事件</h2>
      <div className="rounded-2xl border border-border/70 bg-card">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <ShieldAlert className="size-6 opacity-50" />
            暂无安全事件，账户状态良好
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>范围</TableHead>
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
                    <TableCell className="text-muted-foreground">
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
                    <TableCell className="text-muted-foreground">{event.detail ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
