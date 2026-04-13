"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Form, Input, message } from "antd";
import { useState } from "react";
import { persistAdminToken } from "@/lib/admin-token";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as {
        statusCode: number;
        data?: { access_token: string };
        error?: string;
        message?: string;
      };

      if (data.statusCode === 200 && data.data?.access_token) {
        persistAdminToken(data.data.access_token);
        message.success("登录成功");
        const redirect = searchParams.get("redirect") ?? "/admin/dashboard";
        router.replace(redirect);
        router.refresh();
      } else {
        message.error(data.error || data.message || "登录失败");
      }
    } catch {
      message.error("登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      }}
    >
      <Card title="天赐印记后台" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
