import { defineStore } from "pinia";
import { useQuery, useMutation } from "@pinia/colada";

interface UserInfo {
  id: number;
  username: string;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  statusCode: number;
  data?: { access_token: string };
  error?: string;
  message?: string;
}

interface UserInfoResponse {
  statusCode: number;
  data?: UserInfo;
  error?: string;
}

interface State {
  token: string | null;
  userInfo: UserInfo | null;
}

export const useUserStore = defineStore("user", {
  state: (): State => ({
    token: process.client ? localStorage.getItem("token") : null,
    userInfo: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      if (process.client) {
        localStorage.setItem("token", token);
      }
    },
    logout() {
      this.token = null;
      this.userInfo = null;
      if (process.client) {
        localStorage.removeItem("token");
      }
    },
    async fetchUserInfo() {
      if (!this.token) return false;

      try {
        const res = await $fetch<UserInfoResponse>("/api/users/info", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        if (res.statusCode === 200 && res.data) {
          this.userInfo = res.data;
          return true;
        }

        // token 无效，立即清理登录态，避免重复请求
        this.logout();
        return false;
      } catch {
        // 请求失败（常见是 401），立即清理登录态，避免路由循环
        this.logout();
        return false;
      }
    },
  },
});

// 导出 composables 供组件使用
export const useLogin = () => {
  const userStore = useUserStore();

  return useMutation({
    mutationFn: async (values: { username: string; password: string }) => {
      return await $fetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: values,
      });
    },
    onSuccess: async (data) => {
      if (data.statusCode === 200 && data.data?.access_token) {
        userStore.setToken(data.data.access_token);
        // 获取用户信息
        const userInfoRes = await $fetch<UserInfoResponse>("/api/users/info", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.data.access_token}`,
          },
        });
        if (userInfoRes.statusCode === 200 && userInfoRes.data) {
          userStore.userInfo = userInfoRes.data;
        }
      }
    },
  });
};

export const useFetchUserInfo = () => {
  const userStore = useUserStore();

  return useQuery({
    queryKey: () => ["userInfo", userStore.token],
    queryFn: async () => {
      if (!userStore.token) return null;

      const res = await $fetch<UserInfoResponse>("/api/users/info", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      });

      if (res.statusCode === 200 && res.data) {
        userStore.userInfo = res.data;
        return res.data;
      }

      return null;
    },
    enabled: () => !!userStore.token,
  });
};

