import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "登录",
  description: "登录 L-API 控制台，管理你的 API 密钥与用量。",
};

export default function LoginPage() {
  return <LoginForm />;
}
