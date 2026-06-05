/**
 * 限流与风控策略（纯常量，无依赖，可被任意层引用）。
 * 生产可按需调整；多实例部署请配置 Upstash 以共享计数。
 */

/** 吞吐限流：固定窗口计数。limit = 窗口内最大次数。 */
export const THROUGHPUT_POLICIES = {
  /** 单密钥调用频率 */
  apiPerKey: { limit: 60, windowMs: 60_000 },
  /** 单 IP 调用频率（含未带密钥的请求） */
  apiPerIp: { limit: 120, windowMs: 60_000 },
  /** 公共演示（无密钥）按 IP */
  demoPerIp: { limit: 30, windowMs: 60_000 },
  /** 注册按 IP（防批量注册薅积分） */
  register: { limit: 5, windowMs: 60 * 60_000 },
  /** 单用户每日免费调用上限 */
  dailyQuota: { limit: 2000, windowMs: 24 * 60 * 60_000 },
} as const;

export type ThroughputPolicy = keyof typeof THROUGHPUT_POLICIES;

/** 滥用/风控：窗口内失败达到 threshold 即临时封禁 banMs。 */
export const ABUSE_POLICIES = {
  /** 登录失败爆破锁定（按 邮箱+IP） */
  login: { threshold: 8, windowMs: 15 * 60_000, banMs: 15 * 60_000 },
  /** 接口错误过多临时封禁密钥 */
  apiKey: { threshold: 40, windowMs: 60_000, banMs: 10 * 60_000 },
} as const;

export type AbusePolicy = keyof typeof ABUSE_POLICIES;

/** 各策略的中文名称与说明（后台展示用）。 */
export const POLICY_LABELS: Record<ThroughputPolicy | AbusePolicy, { name: string; desc: string }> =
  {
    apiPerKey: { name: "单密钥调用频率", desc: "同一 API 密钥在窗口内的最大调用次数" },
    apiPerIp: { name: "单 IP 调用频率", desc: "同一 IP（含无密钥）在窗口内的最大调用次数" },
    demoPerIp: { name: "公共演示频率", desc: "官网在线调试按 IP 限流" },
    register: { name: "注册频率", desc: "同一 IP 的注册次数限制，防批量薅积分" },
    dailyQuota: { name: "每日免费配额", desc: "单用户每日最大调用次数" },
    login: { name: "登录失败锁定", desc: "邮箱+IP 失败达到阈值后临时锁定登录" },
    apiKey: { name: "接口滥用封禁", desc: "密钥短时间内错误过多则临时封禁" },
  };
