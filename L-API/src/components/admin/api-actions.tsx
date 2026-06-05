"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateApi } from "@/server/actions/admin";

export interface AdminApi {
  id: string;
  name: string;
  slug: string;
  summary: string;
  pricePerCall: number;
  status: "ACTIVE" | "BETA" | "DEPRECATED";
  featured: boolean;
}

export function ApiActions({ api }: { api: AdminApi }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    fd.set("apiId", api.id);
    startTransition(async () => {
      const res = await updateApi(fd);
      if (res.ok) {
        toast.success("接口已更新");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label="编辑"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑接口</DialogTitle>
            <DialogDescription>
              {api.name}（{api.slug}）
            </DialogDescription>
          </DialogHeader>
          <form id="api-edit-form" onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary">简介</Label>
              <Input id="summary" name="summary" defaultValue={api.summary} />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerCall">单价（积分/次）</Label>
                <Input
                  id="pricePerCall"
                  name="pricePerCall"
                  type="number"
                  min={0}
                  defaultValue={api.pricePerCall}
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={api.status}
                  className="h-9 w-32 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="ACTIVE">上线</option>
                  <option value="BETA">测试</option>
                  <option value="DEPRECATED">下线</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch name="featured" defaultChecked={api.featured} />
              设为推荐（首页精选）
            </label>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" form="api-edit-form" disabled={pending}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
