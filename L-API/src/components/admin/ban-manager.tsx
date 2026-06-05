"use client";

import { Ban, ShieldOff } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { manualBan, manualUnban } from "@/server/actions/admin";

const SCOPES = [
  { value: "ip", label: "IP 地址" },
  { value: "apiKey", label: "API 密钥 ID" },
  { value: "user", label: "用户 ID" },
  { value: "login", label: "登录标识(邮箱:IP)" },
];

export function BanManager() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function run(action: typeof manualBan) {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await action(formData);
      if (res.ok) {
        toast.success("操作成功");
        if (action === manualBan) form.reset();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form ref={formRef} className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">范围</span>
          <select
            name="scope"
            defaultValue="ip"
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs text-muted-foreground">标识</span>
          <Input name="identifier" placeholder="例如 1.2.3.4 或密钥 ID" className="h-9" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">封禁时长</span>
          <div className="flex items-center gap-1.5">
            <Input type="number" name="minutes" defaultValue={30} min={1} className="h-9 w-28" />
            <span className="text-xs text-muted-foreground">分钟</span>
          </div>
        </label>
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => run(manualUnban)}
          >
            <ShieldOff className="size-4" /> 解封
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => run(manualBan)}
          >
            <Ban className="size-4" /> 封禁
          </Button>
        </div>
      </div>
    </form>
  );
}
