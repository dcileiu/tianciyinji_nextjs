"use client";

import { KeyRound, Loader2, Plus, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { maskApiKey } from "@/lib/api-key";
import { formatDateTime } from "@/lib/format";
import { createApiKeyAction, revokeApiKeyAction } from "@/server/actions/dashboard";

export interface KeyItem {
  id: string;
  name: string;
  prefix: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
  lastUsedAt: string | null;
}

export function KeysManager({ keys }: { keys: KeyItem[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    const res = await createApiKeyAction(name);
    setCreating(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setCreateOpen(false);
    setName("");
    setRevealedKey(res.data?.key ?? null);
    router.refresh();
  }

  async function handleRevoke(id: string) {
    if (!window.confirm("吊销后使用该密钥的调用将立即失效，确定吗？")) return;
    setPendingId(id);
    const res = await revokeApiKeyAction(id);
    setPendingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("密钥已吊销");
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          创建密钥
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card">
        {keys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <KeyRound className="size-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">还没有 API 密钥</p>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              创建第一个密钥
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>密钥</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最近使用</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {maskApiKey(key.prefix)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.status === "ACTIVE" ? "secondary" : "outline"}>
                      {key.status === "ACTIVE" ? "启用" : "已吊销"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {key.lastUsedAt ? formatDateTime(key.lastUsedAt) : "从未"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(key.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {key.status === "ACTIVE" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pendingId === key.id}
                        onClick={() => handleRevoke(key.id)}
                      >
                        {pendingId === key.id ? <Loader2 className="animate-spin" /> : null}
                        吊销
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 创建对话框 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建 API 密钥</DialogTitle>
            <DialogDescription>为密钥取一个便于识别的名称。</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="key-name">名称</Label>
            <Input
              id="key-name"
              value={name}
              placeholder="例如：生产环境"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="animate-spin" /> : null}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 明文展示对话框 */}
      <Dialog open={revealedKey !== null} onOpenChange={(o) => !o && setRevealedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>密钥已创建</DialogTitle>
            <DialogDescription>请立即复制并妥善保存，密钥仅显示这一次。</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            离开此弹窗后将无法再次查看完整密钥。
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 p-2">
            <code className="min-w-0 flex-1 truncate px-1 font-mono text-xs">{revealedKey}</code>
            {revealedKey && <CopyButton value={revealedKey} />}
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>我已保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
