import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./schema";

type Db = MySql2Database<typeof schema>;

let pool: mysql.Pool | null = null;
let dbInstance: Db | null = null;

export function getDb(): Db {
  if (dbInstance) {
    return dbInstance;
  }

  const config = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  };

  let host = (config.DB_HOST || "127.0.0.1").toString().trim();
  host = host.replace(/^https?:\/\//, "");
  if (host.includes(":")) {
    const hostParts = host.split(":");
    host = hostParts[0] || "127.0.0.1";
  }
  host = host.replace(/\/$/, "");

  let port = Number(config.DB_PORT ?? 3306);
  const hostWithPort = (config.DB_HOST ?? "").toString();
  if (hostWithPort.includes(":") && hostWithPort.match(/:\d+/)) {
    const portMatch = hostWithPort.match(/:(\d+)/);
    if (portMatch) {
      port = Number(portMatch[1]);
    }
  }

  const dbUser = config.DB_USERNAME || "";
  const dbPassword = config.DB_PASSWORD || "";

  if (!dbUser) {
    throw new Error("缺少数据库用户名(DB_USERNAME)，请在环境变量中配置");
  }

  const dbConfig: mysql.PoolOptions = {
    host,
    port,
    user: dbUser,
    password: dbPassword,
    database: config.DB_NAME || "itianci",
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements: false,
    charset: "utf8mb4",
    timezone: "Z",
    typeCast(field, next) {
      if (field.type === "TINY" && "length" in field && field.length === 1) {
        return field.string() === "1";
      }
      return next();
    },
  };

  pool = mysql.createPool(dbConfig);

  dbInstance = drizzle(pool, {
    schema,
    mode: "default",
  });

  return dbInstance;
}

/** 延迟初始化连接池，避免仅 import 模块时即要求数据库可用 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop: string | symbol) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, instance);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
