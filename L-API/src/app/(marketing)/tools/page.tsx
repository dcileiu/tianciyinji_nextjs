import { FileJson, Hash, KeyRound, Link2, Palette, QrCode } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "在线工具",
  description: "L-API 在线工具集合，免登录即用的开发与日常小工具，敬请期待。",
  alternates: { canonical: "/tools" },
};

const tools = [
  { icon: QrCode, name: "二维码生成", desc: "文本/链接一键生成二维码" },
  { icon: Hash, name: "哈希计算", desc: "MD5 / SHA1 / SHA256 在线计算" },
  { icon: KeyRound, name: "密码生成", desc: "可定制强度的随机密码" },
  { icon: FileJson, name: "JSON 格式化", desc: "校验、压缩与美化 JSON" },
  { icon: Link2, name: "URL 编解码", desc: "URL 编码与解码转换" },
  { icon: Palette, name: "颜色转换", desc: "HEX / RGB / OKLCH 互转" },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">在线工具</h1>
        <p className="mt-3 text-muted-foreground">
          免登录即用的开发与日常小工具，更多工具正在路上。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <tool.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-semibold">{tool.name}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  即将上线
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{tool.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
