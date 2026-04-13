module.exports = {
  apps: [
    {
      name: "tianciyinji_api", // 使用和旧项目相同的名称，方便覆盖
      script: ".output/server/index.mjs",
      cwd: "/www/wwwroot/tianciyinji.api", // 使用旧项目的目录路径
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        NITRO_PORT: 3001,
        NITRO_HOST: "0.0.0.0",
        // 数据库配置（PM2 在生产环境不会自动读取 .env，必须在这里设置）
        DB_HOST: "127.0.0.1",
        DB_PORT: "3306",
        DB_USERNAME: "itianci",
        DB_PASSWORD: "zAfcfAL6JNa5cysW",
        DB_NAME: "itianci",
        // JWT 配置
        JWT_SECRET: "nuxt-admin-production-secret-key-change-this",
        JWT_EXPIRES_IN: "7d",
        // 其他配置
        SMMS_TOKEN: "",
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
      watch: false,
      ignore_watch: ["node_modules", ".nuxt", ".output", "logs"],
    },
  ],
};
