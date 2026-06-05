"use client";

import { Save } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSecurityPolicies } from "@/server/actions/admin";

export type ThroughputRow = {
  key: string;
  name: string;
  desc: string;
  limit: number;
  windowSec: number;
  enabled: boolean;
};

export type AbuseRow = {
  key: string;
  name: string;
  desc: string;
  threshold: number;
  windowSec: number;
  banMin: number;
  enabled: boolean;
};

function Field({
  label,
  name,
  defaultValue,
  suffix,
}: {
  label: string;
  name: string;
  defaultValue: number;
  suffix: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <Input type="number" name={name} defaultValue={defaultValue} min={1} className="h-9 w-28" />
        <span className="text-xs text-muted-foreground">{suffix}</span>
      </div>
    </label>
  );
}

export function PolicyEditor({
  throughput,
  abuse,
}: {
  throughput: ThroughputRow[];
  abuse: AbuseRow[];
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const res = await updateSecurityPolicies(formData);
      if (res.ok) toast.success("策略已保存，立即生效");
      else toast.error(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">吞吐限流</h2>
        <div className="space-y-3">
          {throughput.map((row) => (
            <div key={row.key} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  启用
                  <Switch name={`t_${row.key}_enabled`} defaultChecked={row.enabled} />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-5">
                <Field
                  label="最大次数"
                  name={`t_${row.key}_limit`}
                  defaultValue={row.limit}
                  suffix="次"
                />
                <Field
                  label="时间窗口"
                  name={`t_${row.key}_window`}
                  defaultValue={row.windowSec}
                  suffix="秒"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">风控 / 自动封禁</h2>
        <div className="space-y-3">
          {abuse.map((row) => (
            <div key={row.key} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  启用
                  <Switch name={`a_${row.key}_enabled`} defaultChecked={row.enabled} />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-5">
                <Field
                  label="失败阈值"
                  name={`a_${row.key}_threshold`}
                  defaultValue={row.threshold}
                  suffix="次"
                />
                <Field
                  label="统计窗口"
                  name={`a_${row.key}_window`}
                  defaultValue={row.windowSec}
                  suffix="秒"
                />
                <Field
                  label="封禁时长"
                  name={`a_${row.key}_ban`}
                  defaultValue={row.banMin}
                  suffix="分钟"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" disabled={pending} className="shadow-lg">
          <Save className="size-4" />
          {pending ? "保存中…" : "保存策略"}
        </Button>
      </div>
    </form>
  );
}
