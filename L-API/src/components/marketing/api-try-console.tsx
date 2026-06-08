"use client";

import { Braces, ChevronDown, KeyRound, Loader2, Play, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiParam } from "@/lib/api-view";
import { methodBadgeClass } from "@/lib/api-view";
import { cn } from "@/lib/utils";
import { runDemo } from "@/server/actions/demo";

interface RunResult {
  ok: boolean;
  status: number;
  body: string;
}

export function ApiTryConsole({
  slug,
  method,
  domain,
  path,
  fields,
  defaults,
}: {
  slug: string;
  method: string;
  domain: string;
  path: string;
  fields: ApiParam[];
  defaults: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(true);
  const [bodyOpen, setBodyOpen] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  function fillExample() {
    setValues(Object.fromEntries(fields.map((f) => [f.name, defaults[f.name] ?? ""])));
  }

  async function send() {
    setLoading(true);
    setResult(null);
    const res = await runDemo(slug, values);
    setLoading(false);
    if (res.ok) {
      setResult({ ok: true, status: 200, body: JSON.stringify(res.data, null, 2) });
    } else {
      setResult({ ok: false, status: 400, body: res.error });
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      {/* Endpoint 条 */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span
          className={cn(
            "rounded-md px-2 py-1 font-mono text-xs font-bold",
            methodBadgeClass(method),
          )}
        >
          {method}
        </span>
        <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
          {domain}
        </span>
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{path}</code>
        <div className="ml-auto flex items-center gap-2">
          {open ? (
            <>
              <Button size="sm" onClick={send} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
                发送
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                取消
              </button>
            </>
          ) : (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Play />
              试一试
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-t border-border/60 bg-muted/20 p-3">
          {/* 认证 */}
          <Panel
            icon={KeyRound}
            title="认证"
            open={authOpen}
            onToggle={() => setAuthOpen((v) => !v)}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">authorization</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  Bearer
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                公开演示无需密钥；正式调用请在请求头携带{" "}
                <code className="rounded bg-muted px-1 font-mono">x-api-key</code>。
                <Link href="/dashboard/keys" className="ml-1 text-primary hover:underline">
                  获取密钥
                </Link>
              </p>
            </div>
          </Panel>

          {/* Body / 参数 */}
          <Panel
            icon={Braces}
            title="Body"
            open={bodyOpen}
            onToggle={() => setBodyOpen((v) => !v)}
            action={
              fields.length > 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fillExample();
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:underline"
                >
                  <Sparkles className="size-3.5" />
                  填充示例
                </button>
              ) : null
            }
          >
            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground">该接口无需参数。</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-start"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-medium">{field.name}</span>
                        <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="rounded bg-rose-500/10 px-1 text-[10px] text-rose-600 dark:text-rose-400">
                            required
                          </span>
                        )}
                      </div>
                      {field.description && (
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                      )}
                    </div>
                    <Input
                      value={values[field.name] ?? ""}
                      placeholder={defaults[field.name] ?? field.description}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* 响应 */}
          {result && (
            <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">响应</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                      result.ok
                        ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/12 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {result.ok ? "200 OK" : "ERROR"}
                  </span>
                </div>
                <CopyButton value={result.body} />
              </div>
              <pre
                className={cn(
                  "max-h-80 overflow-auto p-3 font-mono text-xs leading-relaxed",
                  !result.ok && "text-rose-600 dark:text-rose-400",
                )}
              >
                {result.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  open,
  onToggle,
  action,
  children,
}: {
  icon: typeof KeyRound;
  title: string;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {action}
      </div>
      {open && <div className="border-t border-border/60 px-3 py-3">{children}</div>}
    </div>
  );
}
