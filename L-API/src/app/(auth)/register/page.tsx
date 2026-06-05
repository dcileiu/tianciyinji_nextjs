import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "注册",
  description: "注册 L-API 账号，免费领取调用积分。",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
