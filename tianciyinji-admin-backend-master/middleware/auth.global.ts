import { useUserStore } from "../stores/user";

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();

  // 不需要认证的页面列表
  const publicPaths = ["/login"];

  const requiresAuth = !publicPaths.includes(to.path);

  if (requiresAuth) {
    if (!userStore.token) {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }

    // 已经在登录页时不再重复请求用户信息
    if (to.path !== "/login" && !userStore.userInfo) {
      const ok = await userStore.fetchUserInfo();
      if (!ok) {
        return navigateTo({
          path: "/login",
          query: { redirect: to.fullPath },
        });
      }
    }
  }

  if (to.path === "/login" && userStore.isLoggedIn) {
    return navigateTo("/");
  }
});

