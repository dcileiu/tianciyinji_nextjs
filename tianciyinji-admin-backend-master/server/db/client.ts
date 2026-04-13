import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

let pool: mysql.Pool | null = null;
let dbInstance: any = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  // 优先使用 process.env（在 Nuxt server 环境中可用）
  // 如果需要在事件处理器中使用 runtimeConfig，可以在那里调用
  const config = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  };
  
  // 清理 host 配置，移除 http:// 和端口号（如果有）
  let host = (config.DB_HOST || "127.0.0.1").toString().trim();
  // 移除 http:// 或 https:// 前缀
  host = host.replace(/^https?:\/\//, "");
  // 如果包含端口号，提取 IP 地址部分
  if (host.includes(":")) {
    const hostParts = host.split(":");
    host = hostParts[0] || "127.0.0.1";
  }
  // 移除尾部斜杠
  host = host.replace(/\/$/, "");

  // 解析端口号（如果 DB_HOST 中包含端口，优先使用）
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
    throw new Error("缺少数据库用户名(DB_USERNAME)，请在 PM2 env 或 .env 中配置");
  }

  const dbConfig = {
    host,
    port,
    user: dbUser,
    password: dbPassword,
    database: config.DB_NAME || "itianci",
    // MySQL 连接池选项
    connectionLimit: 5, // 减少连接数，避免触发限制
    waitForConnections: true,
    queueLimit: 0,
    // 连接超时设置（毫秒）
    connectTimeout: 10000, // 10秒（减少超时时间，快速失败）
    // 空闲连接超时（毫秒）
    idleTimeout: 300000, // 5分钟
    // 启用连接保活
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // 连接选项
    multipleStatements: false,
    // 字符集
    charset: "utf8mb4",
    // 时区
    timezone: "Z", // 使用 UTC
    // 禁用 DNS 解析（可能加快连接速度）
    // 注意：如果 MySQL 配置了 skip-name-resolve，这个选项可能会有帮助
    // 但我们先不设置，看看是否能连接
    // 重试选项
    reconnect: true,
    // 确保字段名大小写正确处理
    typeCast: function (field: any, next: any) {
      if (field.type === "TINY" && field.length === 1) {
        return field.string() === "1";
      }
      return next();
    },
  };

  console.log("数据库连接配置:", {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    passwordSet: !!dbConfig.password,
  });

  pool = mysql.createPool(dbConfig);

  // 添加连接事件监听器，用于调试
  pool.on("connection", (connection) => {
    console.log("🔌 新数据库连接已建立");
    connection.on("error", (err: any) => {
      console.error("❌ 数据库连接错误:", err.message);
    });
  });

  // 异步测试数据库连接（不阻塞初始化）
  (async () => {
    try {
      const testConnection = await pool.getConnection();
      // 设置会话变量，增加超时时间
      await testConnection.query("SET SESSION wait_timeout = 28800");
      await testConnection.query("SET SESSION interactive_timeout = 28800");
      await testConnection.query("SELECT 1");
      testConnection.release();
      console.log("✅ 数据库连接测试成功");
    } catch (error: any) {
      console.error("❌ 数据库连接测试失败:", error.message);
      console.error("错误详情:", {
        code: error?.code,
        errno: error?.errno,
        sqlState: error?.sqlState,
        sqlMessage: error?.sqlMessage,
      });
      console.error("连接配置:", {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
      });
      // 不抛出错误，让应用继续启动，但会在实际查询时失败
    }
  })();

  dbInstance = drizzle(pool, {
    schema,
    mode: "default",
  });

  return dbInstance;
}

// 导出 db 实例，保持向后兼容
export const db = getDb();


