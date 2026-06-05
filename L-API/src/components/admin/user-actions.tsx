"use client";

import { Coins, MoreHorizontal, ShieldCheck, ShieldOff } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adjustUserCredits, setUserRole } from "@/server/actions/admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  credits: number;
}

export function UserActions({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [pending, startTransition] = useTransition();

  function submitCredits() {
    const value = Number(delta);
    if (!Number.isInteger(value) || value === 0) {
      toast.error("请输入非零整数");
      return;
    }
    const fd = new FormData();
    fd.set("userId", user.id);
    fd.set("delta", String(value));
    startTransition(async () => {
      const res = await adjustUserCredits(fd);
      if (res.ok) {
        toast.success("积分已调整");
        setCreditsOpen(false);
        setDelta("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function toggleRole() {
    const next = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`确定将该用户设为「${next === "ADMIN" ? "管理员" : "普通用户"}」？`))
      return;
    const fd = new FormData();
    fd.set("userId", user.id);
    fd.set("role", next);
    startTransition(async () => {
      const res = await setUserRole(fd);
      if (res.ok) {
        toast.success("角色已更新");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="size-8" aria-label="操作" />}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setCreditsOpen(true)}>
            <Coins />
            调整积分
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleRole} disabled={isSelf}>
            {user.role === "ADMIN" ? <ShieldOff /> : <ShieldCheck />}
            {user.role === "ADMIN" ? "降为普通用户" : "设为管理员"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={creditsOpen} onOpenChange={setCreditsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整积分</DialogTitle>
            <DialogDescription>
              {user.name || user.email} 当前余额 {user.credits}，输入增减值（可为负）。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delta">增减积分</Label>
            <Input
              id="delta"
              type="number"
              value={delta}
              placeholder="例如 1000 或 -500"
              onChange={(e) => setDelta(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsOpen(false)}>
              取消
            </Button>
            <Button onClick={submitCredits} disabled={pending}>
              确认调整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
