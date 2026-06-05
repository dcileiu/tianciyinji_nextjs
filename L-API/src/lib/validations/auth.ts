import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "昵称至少 2 个字符").max(40, "昵称过长"),
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(6, "密码至少 6 位").max(72, "密码过长"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
