import { createHash, randomBytes, randomUUID } from "node:crypto";

/** 内置示例接口的执行逻辑。返回数据或抛出 ApiInputError（映射为 400）。 */
export class ApiInputError extends Error {}

function required(params: URLSearchParams, name: string): string {
  const value = params.get(name);
  if (!value) throw new ApiInputError(`缺少必填参数: ${name}`);
  return value;
}

function seededInt(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % max;
}

export async function runApi(slug: string, params: URLSearchParams): Promise<unknown> {
  switch (slug) {
    case "world-time": {
      const timezone = params.get("timezone") || "UTC";
      let datetime: string;
      try {
        datetime = new Intl.DateTimeFormat("sv-SE", {
          timeZone: timezone,
          dateStyle: "short",
          timeStyle: "medium",
        }).format(new Date());
      } catch {
        throw new ApiInputError(`无效的时区: ${timezone}`);
      }
      return { timezone, datetime, unix: Math.floor(Date.now() / 1000) };
    }

    case "ip-info": {
      const ip = required(params, "ip");
      const isV6 = ip.includes(":");
      const isValid = isV6 || /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
      if (!isValid) throw new ApiInputError("无效的 IP 地址");
      const first = Number(ip.split(".")[0] || 0);
      const isPrivate = first === 10 || first === 127 || first === 192 || first === 172;
      return { ip, version: isV6 ? "IPv6" : "IPv4", private: isPrivate };
    }

    case "weather": {
      const city = required(params, "city");
      const conditions = ["晴", "多云", "阴", "小雨", "雷阵雨"];
      return {
        city,
        temp: 12 + seededInt(city, 22),
        weather: conditions[seededInt(city + "w", conditions.length)],
        humidity: 40 + seededInt(city + "h", 50),
      };
    }

    case "phone-area": {
      const phone = required(params, "phone");
      if (!/^1\d{10}$/.test(phone)) throw new ApiInputError("请输入 11 位手机号");
      const provinces = ["广东", "北京", "上海", "江苏", "浙江", "四川", "湖北"];
      const isps = ["移动", "联通", "电信"];
      return {
        phone: `${phone.slice(0, 3)}****${phone.slice(7)}`,
        province: provinces[seededInt(phone, provinces.length)],
        isp: isps[seededInt(phone + "i", isps.length)],
      };
    }

    case "uuid": {
      const count = Math.min(Math.max(Number(params.get("count") || 1), 1), 50);
      return { uuids: Array.from({ length: count }, () => randomUUID()) };
    }

    case "hash-text": {
      const text = required(params, "text");
      return {
        md5: createHash("md5").update(text).digest("hex"),
        sha1: createHash("sha1").update(text).digest("hex"),
        sha256: createHash("sha256").update(text).digest("hex"),
      };
    }

    case "password-gen": {
      const length = Math.min(Math.max(Number(params.get("length") || 16), 6), 64);
      const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
      const bytes = randomBytes(length);
      let password = "";
      for (let i = 0; i < length; i++) password += charset[bytes[i] % charset.length];
      return { password, length };
    }

    case "qrcode": {
      const text = required(params, "text");
      return {
        text,
        url: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`,
      };
    }

    case "avatar": {
      const seed = params.get("seed") || randomUUID();
      return {
        seed,
        url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`,
      };
    }

    case "translate": {
      const text = required(params, "text");
      const to = params.get("to") || "zh";
      return { text, translate: `[${to}] ${text}`, from: "auto", to, note: "示例翻译数据" };
    }

    case "qq-info": {
      const qq = required(params, "qq");
      if (!/^\d{5,12}$/.test(qq)) throw new ApiInputError("无效的 QQ 号");
      return {
        qq,
        nickname: `用户${qq.slice(-4)}`,
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`,
      };
    }

    case "bilibili-live": {
      const room = required(params, "room");
      const living = seededInt(room, 2) === 1;
      return {
        room,
        living,
        title: `示例直播间 ${room}`,
        online: living ? 1000 + seededInt(room + "o", 50000) : 0,
      };
    }

    default: {
      // 未实现的目录接口：回显参数，保证“可调用”。
      return { slug, params: Object.fromEntries(params.entries()), note: "示例响应" };
    }
  }
}
