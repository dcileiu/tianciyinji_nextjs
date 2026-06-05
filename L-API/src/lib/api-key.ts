import { createHash, randomBytes } from "node:crypto";

export const API_KEY_PREFIX = "lapi";

export interface GeneratedApiKey {
  /** 完整明文密钥，仅在创建时返回一次。 */
  key: string;
  /** 可公开展示的前缀，用于在列表中识别。 */
  prefix: string;
  /** sha256 哈希，落库存储。 */
  hash: string;
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): GeneratedApiKey {
  const raw = randomBytes(24).toString("base64url");
  const key = `${API_KEY_PREFIX}_${raw}`;
  const prefix = key.slice(0, 14);
  return { key, prefix, hash: hashApiKey(key) };
}

/** 仅展示前缀 + 掩码，用于控制台展示。 */
export function maskApiKey(prefix: string): string {
  return `${prefix}${"•".repeat(20)}`;
}
