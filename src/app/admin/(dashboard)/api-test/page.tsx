"use client";

import { useState } from "react";
import { Button, Card, Space, Typography, message } from "antd";
import { getAdminToken } from "@/lib/admin-token";

const { Paragraph, Text } = Typography;

async function runGet(url: string, token?: string | null) {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function runPost(
  url: string,
  body: object,
  token?: string | null,
) {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body: j };
}

export default function ApiTestPage() {
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const append = (s: string) =>
    setLines((prev) => [...prev, `${new Date().toISOString()} ${s}`]);

  const runAll = async () => {
    setRunning(true);
    setLines([]);
    const token = getAdminToken();
    try {
      let r = await runGet("/api/health");
      append(`GET /api/health -> ${r.status} ${r.ok}`);

      r = await runGet("/api/statistics");
      append(`GET /api/statistics -> ${r.status}`);

      r = await runGet("/api/categories");
      append(`GET /api/categories -> ${r.status}`);

      r = await runGet("/api/articles/published?page=1");
      append(`GET /api/articles/published -> ${r.status}`);

      if (token) {
        r = await runPost("/api/users/info", {}, token);
        append(`POST /api/users/info -> ${r.status}`);
      } else {
        append("跳过需登录接口（无 token）");
      }

      message.success("批量请求完成");
    } catch (e) {
      append(`错误: ${e instanceof Error ? e.message : String(e)}`);
      message.error("部分请求失败");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>接口测试</h2>
      <Card>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button type="primary" onClick={runAll} loading={running}>
            运行基础用例
          </Button>
          <Text type="secondary">
            完整用例可参考原 Nuxt 项目 pages/api-test.vue；此处为快速连通性检查。
          </Text>
          <Paragraph>
            <pre
              style={{
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 8,
                maxHeight: 400,
                overflow: "auto",
              }}
            >
              {lines.join("\n") || "点击按钮开始"}
            </pre>
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
}
