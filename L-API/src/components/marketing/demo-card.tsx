"use client";

import { Loader2, Play } from "lucide-react";
import { useState } from "react";
import type { ApiParam } from "@/lib/api-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { runDemo } from "@/server/actions/demo";
import { cn } from "@/lib/utils";

const DEFAULTS: Record<string, string> = {
  timezone: "Asia/Shanghai",
  ip: "8.8.8.8",
  city: "上海",
  phone: "13800138000",
  text: "Hello, L-API",
  count: "3",
  length: "16",
  qq: "10000",
  room: "1",
  to: "zh",
  seed: "lapi",
};

function defaultFor(field: ApiParam): string {
  return DEFAULTS[field.name] ?? "";
}

export function DemoCard({
  slug,
  method = "GET",
  fields,
  className,
}: {
  slug: string;
  method?: string;
  fields: ApiParam[];
  className?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, defaultFor(f)])),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = Object.entries(values)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  async function run() {
    setLoading(true);
    setError(null);
    const res = await runDemo(slug, values);
    setLoading(false);
    if (res.ok) {
      setResult(JSON.stringify(res.data, null, 2));
    } else {
      setError(res.error);
      setResult(null);
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-rose-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
          {method} /api/v1/{slug}
          {query ? `?${query}` : ""}
        </span>
      </div>

      <div className="space-y-4 p-4">
        {fields.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={`demo-${slug}-${field.name}`} className="text-xs">
                  {field.name}
                  {field.required && <span className="ml-0.5 text-destructive">*</span>}
                </Label>
                <Input
                  id={`demo-${slug}-${field.name}`}
                  value={values[field.name] ?? ""}
                  placeholder={field.description}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}

        <Button onClick={run} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="animate-spin" /> : <Play />}
          {loading ? "运行中…" : "运行示例"}
        </Button>

        {(result || error) && (
          <pre
            className={cn(
              "max-h-72 overflow-auto rounded-xl bg-foreground/[0.03] p-4 font-mono text-xs leading-relaxed ring-1 ring-border/60",
              error && "text-destructive",
            )}
          >
            {error ? `// ${error}` : result}
          </pre>
        )}
      </div>
    </div>
  );
}
