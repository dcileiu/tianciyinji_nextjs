import { defineNuxtPlugin, navigateTo } from "#app";
import { useUserStore } from "../stores/user";

let isRedirectingToLogin = false;

export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    onRequest({ request, options }) {
      const url = String(request);
      const isApiRequest = url.startsWith("/api");
      if (!isApiRequest) return;

      const userStore = useUserStore();
      const token = userStore.token || (process.client ? localStorage.getItem("token") : null);

      if (token) {
        const headers = new Headers(options.headers as HeadersInit | undefined);
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        options.headers = headers;
      }
    },
    async onResponseError({ response }) {
      if (response?.status === 401 && process.client) {
        const userStore = useUserStore();
        userStore.logout();

        // 防止多个并发 401 导致重复跳转和重复请求
        if (isRedirectingToLogin) return;
        isRedirectingToLogin = true;

        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          await navigateTo({ path: "/login", query: { redirect: window.location.pathname } });
        }

        // 下一次登录后允许重新跳转
        setTimeout(() => {
          isRedirectingToLogin = false;
        }, 300);
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
