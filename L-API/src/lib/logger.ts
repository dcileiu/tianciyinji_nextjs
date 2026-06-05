type Level = "debug" | "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";

function write(level: Level, msg: string, meta?: Record<string, unknown>) {
  const entry = { level, msg, time: new Date().toISOString(), ...meta };
  const line = isProd
    ? JSON.stringify(entry)
    : `[${level}] ${msg}${meta ? ` ${JSON.stringify(meta)}` : ""}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** 结构化日志：生产输出 JSON（便于采集），开发输出可读文本。 */
export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => write("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => write("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write("error", msg, meta),
};
