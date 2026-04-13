// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-02-28",
  devtools: { enabled: true },

  modules: ["@pinia/nuxt"],

  ssr: true,

  routeRules: {
    // 禁用登录和测试页面的 SSR
    "/login": { ssr: false },
    "/api-test": { ssr: false },
    // 禁用所有管理页面的 SSR（使用 Ant Design Vue）
    "/": { ssr: false },
    "/dashboard": { ssr: false },
    "/articles/**": { ssr: false },
    "/categories": { ssr: false },
    "/tags": { ssr: false },
    "/banners": { ssr: false },
    "/advertisements": { ssr: false },
    "/logs": { ssr: false },
    "/tasks": { ssr: false },
    "/visits": { ssr: false },
  },

  runtimeConfig: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
    SMMS_TOKEN: process.env.SMMS_TOKEN,
  },
});

