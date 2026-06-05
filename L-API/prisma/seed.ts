import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function genKey() {
  const raw = randomBytes(24).toString("base64url");
  const key = `lapi_${raw}`;
  const prefix = key.slice(0, 14);
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, prefix, hash };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const categories = [
  {
    slug: "data",
    name: "数据查询",
    icon: "Database",
    order: 1,
    description: "天气、IP、归属地等公开数据查询接口。",
  },
  {
    slug: "dev",
    name: "开发工具",
    icon: "Terminal",
    order: 2,
    description: "UUID、哈希、随机密码等开发常用接口。",
  },
  {
    slug: "media",
    name: "多媒体",
    icon: "Image",
    order: 3,
    description: "二维码、图片处理等多媒体接口。",
  },
  {
    slug: "life",
    name: "生活服务",
    icon: "Sparkles",
    order: 4,
    description: "翻译、社交资料等生活场景接口。",
  },
];

type SeedApi = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  method: string;
  category: string;
  pricePerCall: number;
  featured?: boolean;
  popularity: number;
  status?: "ACTIVE" | "BETA" | "DEPRECATED";
  params?: { name: string; type: string; required: boolean; description: string }[];
  sampleResponse?: unknown;
};

const apis: SeedApi[] = [
  {
    slug: "world-time",
    name: "查询世界时间",
    summary: "需要和国外的朋友开会，想知道他那边现在几点？用这个接口一查便知。",
    description: "根据时区返回当前时间，支持常见时区标识。",
    method: "GET",
    category: "data",
    pricePerCall: 1,
    featured: true,
    popularity: 9820,
    params: [
      {
        name: "timezone",
        type: "string",
        required: false,
        description: "时区，如 Asia/Shanghai，默认 UTC",
      },
    ],
    sampleResponse: {
      timezone: "Asia/Shanghai",
      datetime: "2026-06-05T18:00:00+08:00",
      unix: 1780999200,
    },
  },
  {
    slug: "ip-info",
    name: "查询 IP 信息",
    summary: "查询任意 IP 的基础信息，便于做访问分析与风控参考。",
    description: "返回 IP 的版本、是否私有、基础元信息等。",
    method: "GET",
    category: "data",
    pricePerCall: 1,
    featured: true,
    popularity: 8730,
    params: [{ name: "ip", type: "string", required: true, description: "要查询的 IP 地址" }],
    sampleResponse: { ip: "8.8.8.8", version: "IPv4", private: false },
  },
  {
    slug: "weather",
    name: "查询实时天气",
    summary: "输入城市，返回示例天气数据，适合做天气卡片演示。",
    description: "返回城市的示例天气信息（温度、天气、湿度）。",
    method: "GET",
    category: "data",
    pricePerCall: 2,
    popularity: 7610,
    params: [{ name: "city", type: "string", required: true, description: "城市名" }],
    sampleResponse: { city: "上海", temp: 26, weather: "多云", humidity: 65 },
  },
  {
    slug: "phone-area",
    name: "手机号归属地",
    summary: "通过手机号前段返回示例归属地与运营商信息。",
    description: "返回手机号的省份、城市与运营商（示例数据）。",
    method: "GET",
    category: "data",
    pricePerCall: 1,
    popularity: 6240,
    params: [{ name: "phone", type: "string", required: true, description: "11 位手机号" }],
    sampleResponse: { phone: "138****0000", province: "广东", city: "深圳", isp: "移动" },
  },
  {
    slug: "uuid",
    name: "生成 UUID",
    summary: "快速生成一个或多个 UUID v4，用于唯一标识。",
    description: "返回指定数量的 UUID v4。",
    method: "GET",
    category: "dev",
    pricePerCall: 1,
    featured: true,
    popularity: 9120,
    params: [
      { name: "count", type: "number", required: false, description: "生成数量，默认 1，最大 50" },
    ],
    sampleResponse: { uuids: ["3f0c8e0a-9b1e-4a3d-8c2f-1a2b3c4d5e6f"] },
  },
  {
    slug: "hash-text",
    name: "文本哈希",
    summary: "对文本计算 md5 / sha1 / sha256 哈希值。",
    description: "返回输入文本的多种哈希结果。",
    method: "GET",
    category: "dev",
    pricePerCall: 1,
    popularity: 5530,
    params: [{ name: "text", type: "string", required: true, description: "要计算的文本" }],
    sampleResponse: { md5: "...", sha1: "...", sha256: "..." },
  },
  {
    slug: "password-gen",
    name: "随机密码生成",
    summary: "生成高强度随机密码，可指定长度。",
    description: "返回符合长度要求的随机密码。",
    method: "GET",
    category: "dev",
    pricePerCall: 1,
    popularity: 4870,
    params: [
      { name: "length", type: "number", required: false, description: "长度，默认 16，范围 6-64" },
    ],
    sampleResponse: { password: "aB3$kP9!xZ2#qWmL" },
  },
  {
    slug: "qrcode",
    name: "二维码生成",
    summary: "把文本或链接生成二维码图片地址。",
    description: "返回二维码图片的可访问地址（示例）。",
    method: "GET",
    category: "media",
    pricePerCall: 2,
    featured: true,
    popularity: 8050,
    params: [{ name: "text", type: "string", required: true, description: "二维码内容" }],
    sampleResponse: { url: "https://api.qrserver.com/v1/create-qr-code/?data=hello" },
  },
  {
    slug: "avatar",
    name: "随机头像",
    summary: "根据种子返回一个稳定的示例头像地址。",
    description: "返回基于种子生成的头像图片地址。",
    method: "GET",
    category: "media",
    pricePerCall: 1,
    popularity: 3920,
    params: [{ name: "seed", type: "string", required: false, description: "头像种子" }],
    sampleResponse: { url: "https://api.dicebear.com/7.x/identicon/svg?seed=lapi" },
  },
  {
    slug: "translate",
    name: "机器翻译",
    summary: "自动检测语言并翻译文本（示例数据）。",
    description: "返回原文、译文与检测到的源语言。",
    method: "GET",
    category: "life",
    pricePerCall: 3,
    featured: true,
    popularity: 9450,
    params: [
      { name: "text", type: "string", required: true, description: "待翻译文本" },
      { name: "to", type: "string", required: false, description: "目标语言，默认 zh" },
    ],
    sampleResponse: {
      text: "Simplicity is the ultimate sophistication.",
      translate: "简约是极致的复杂。",
      from: "en",
      to: "zh",
    },
  },
  {
    slug: "qq-info",
    name: "查询 QQ 信息",
    summary: "通过 QQ 号查询用户资料，返回头像、昵称、个性签名等信息（示例）。",
    description: "返回 QQ 号对应的示例资料。",
    method: "GET",
    category: "life",
    pricePerCall: 2,
    popularity: 7200,
    params: [{ name: "qq", type: "string", required: true, description: "QQ 号" }],
    sampleResponse: {
      qq: "10000",
      nickname: "示例用户",
      avatar: "https://q1.qlogo.cn/g?b=qq&nk=10000&s=100",
    },
  },
  {
    slug: "bilibili-live",
    name: "查询 B 站直播间",
    summary: "想知道你喜欢的主播开播了吗？用这个接口查询直播间状态（示例）。",
    description: "返回直播间的开播状态与基础信息。",
    method: "GET",
    category: "life",
    pricePerCall: 2,
    status: "BETA",
    popularity: 6680,
    params: [{ name: "room", type: "string", required: true, description: "直播间号" }],
    sampleResponse: { room: "1", living: true, title: "示例直播间", online: 12345 },
  },
];

const packages = [
  { slug: "trial", name: "体验包", credits: 1000, priceCents: 0, bonus: 0, order: 1 },
  { slug: "basic", name: "基础包", credits: 10000, priceCents: 990, bonus: 500, order: 2 },
  {
    slug: "pro",
    name: "专业包",
    credits: 50000,
    priceCents: 3900,
    bonus: 5000,
    popular: true,
    order: 3,
  },
  {
    slug: "enterprise",
    name: "企业包",
    credits: 200000,
    priceCents: 12900,
    bonus: 30000,
    order: 4,
  },
];

async function main() {
  console.log("Seeding database ...");

  // 清理（开发用）
  await prisma.requestLog.deleteMany();
  await prisma.hotItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.hotSubscription.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.api.deleteMany();
  await prisma.apiCategory.deleteMany();
  await prisma.creditPackage.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.apiCategory.create({ data: c });
    categoryIdBySlug.set(c.slug, created.id);
  }

  const apiIdBySlug = new Map<string, string>();
  for (const a of apis) {
    const created = await prisma.api.create({
      data: {
        slug: a.slug,
        name: a.name,
        summary: a.summary,
        description: a.description,
        method: a.method,
        path: `/api/v1/${a.slug}`,
        pricePerCall: a.pricePerCall,
        status: a.status ?? "ACTIVE",
        popularity: a.popularity,
        featured: a.featured ?? false,
        params: a.params ?? undefined,
        sampleResponse: (a.sampleResponse as object) ?? undefined,
        categoryId: categoryIdBySlug.get(a.category)!,
      },
    });
    apiIdBySlug.set(a.slug, created.id);
  }

  for (const p of packages) {
    await prisma.creditPackage.create({ data: p });
  }

  // 超级管理员账号
  const adminHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@l-api.dev",
      password: adminHash,
      role: "ADMIN",
      credits: 100000,
    },
  });

  // 演示用户
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@l-api.dev",
      password: passwordHash,
      role: "USER",
      credits: 3500,
    },
  });

  // 演示 API 密钥
  const { prefix, hash } = genKey();
  await prisma.apiKey.create({
    data: { userId: user.id, name: "默认密钥", prefix, hash, status: "ACTIVE" },
  });

  // 近 7 天请求日志
  const apiList = [...apiIdBySlug.entries()];
  const now = new Date();
  for (let day = 6; day >= 0; day--) {
    const base = new Date(now);
    base.setDate(now.getDate() - day);
    const count = 6 + Math.floor(Math.random() * 14);
    for (let i = 0; i < count; i++) {
      const [, apiId] = apiList[Math.floor(Math.random() * apiList.length)];
      const ok = Math.random() > 0.08;
      const createdAt = new Date(base);
      createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      await prisma.requestLog.create({
        data: {
          userId: user.id,
          apiId,
          endpoint: "/api/v1",
          statusCode: ok ? 200 : 400,
          latencyMs: 20 + Math.floor(Math.random() * 180),
          creditsCost: ok ? 1 : 0,
          createdAt,
        },
      });
    }
  }

  // 今日热榜
  const today = startOfDay(now);
  const ranked = [...apis].sort((a, b) => b.popularity - a.popularity).slice(0, 10);
  for (let i = 0; i < ranked.length; i++) {
    const a = ranked[i];
    await prisma.hotItem.create({
      data: {
        apiId: apiIdBySlug.get(a.slug)!,
        date: today,
        rank: i + 1,
        calls: a.popularity,
        trend: Math.floor(Math.random() * 40) - 10,
      },
    });
  }

  console.log("Seed completed.");
  console.log("Admin login -> email: admin@l-api.dev  password: admin1234");
  console.log("Demo login  -> email: demo@l-api.dev   password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
