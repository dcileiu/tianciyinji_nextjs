<script setup lang="ts">
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { useApiFetch } from "../composables/useApiFetch";

// @ts-ignore Nuxt auto-import
useHead({
  title: "登录 - 天赐印记后台",
});

// @ts-ignore Nuxt auto-import
definePageMeta({
  layout: "blank",
  ssr: false, // 禁用 SSR，避免 Ant Design Vue 组件在服务端渲染时出错
});

interface LoginForm {
  username: string;
  password: string;
}

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const $api = useApiFetch();
const loading = ref(false);

const form = reactive<LoginForm>({
  username: "",
  password: "",
});

const onFinish = async (values: LoginForm) => {
  try {
    loading.value = true;
    const res = await $api<{
      statusCode: number;
      data?: { access_token: string };
      error?: string;
      message?: string;
    }>("/api/auth/login", {
      method: "POST",
      body: values,
    });

    if (res.statusCode === 200 && res.data?.access_token) {
      userStore.setToken(res.data.access_token);

      // 尝试获取用户信息，但不阻塞页面跳转
      try {
        const userInfoRes = await $api<{
          statusCode: number;
          data?: {
            id: number;
            username: string;
            email?: string;
            createdAt: string;
            updatedAt: string;
          };
          error?: string;
        }>("/api/users/info", {
          method: "POST",
        });

        if (userInfoRes.statusCode === 200 && userInfoRes.data) {
          userStore.userInfo = userInfoRes.data as any;
        }
      } catch (e) {
        // 忽略用户信息获取失败，避免影响登录跳转
      }

      message.success("登录成功");
      const redirect =
        (route.query.redirect as string | undefined) ?? "/dashboard";
      await navigateTo(redirect, { replace: true });
    } else {
      message.error(res.error || res.message || "登录失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || error?.data?.message || "登录失败");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="bg-orbit bg-orbit-1" />
    <div class="bg-orbit bg-orbit-2" />
    <div class="bg-grid" />

    <div class="login-content">
      <a-card class="login-card" :bordered="false">
        <div class="login-header">
          <div class="logo-orbit">
            <span class="logo-dot" />
          </div>
          <div class="title-group">
            <h2 class="login-title">天赐印记 · 控制中枢</h2>
            <p class="login-subtitle">Nuxt Admin Console · Quantum Interface</p>
          </div>
        </div>

        <a-form :model="form" name="login" @finish="onFinish" autocomplete="off">
          <a-form-item
            name="username"
            :rules="[{ required: true, message: '请输入用户名!' }]"
          >
            <a-input
              v-model:value="form.username"
              placeholder="用户名 / Username"
              size="large"
            />
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]"
          >
            <a-input-password
              v-model:value="form.password"
              placeholder="密码 / Password"
              size="large"
            />
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              block
              size="large"
              class="btn-tech"
            >
              进入控制台
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at top, #1b2340 0%, #050716 60%, #020308 100%);
  color: #e5e7eb;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    );
  background-size: 40px 40px;
  opacity: 0.5;
  pointer-events: none;
}

.bg-orbit {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 999px;
  filter: blur(40px);
  opacity: 0.85;
  pointer-events: none;
}

.bg-orbit-1 {
  top: -140px;
  left: -120px;
  background: conic-gradient(
    from 20deg,
    rgba(248, 113, 113, 0.4),
    rgba(251, 113, 133, 0.55),
    rgba(248, 171, 96, 0.45),
    rgba(248, 113, 113, 0.4)
  );
  animation: orbit-rotate 16s linear infinite;
}

.bg-orbit-2 {
  right: -220px;
  bottom: -160px;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle at 30% 10%, #f9731640, transparent 60%),
    radial-gradient(circle at 75% 80%, #ef444440, transparent 55%);
  animation: orbit-pulse 11s ease-in-out infinite;
}

.login-content {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  z-index: 1;
}

.login-card {
  border-radius: 24px;
  background: radial-gradient(circle at top, #111827, #020617 55%);
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(148, 163, 184, 0.18),
    0 0 40px rgba(56, 189, 248, 0.25);
  border: 1px solid rgba(148, 163, 184, 0.4);
  overflow: hidden;
}

.login-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.logo-orbit {
  position: relative;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #f97316, #ef4444);
  box-shadow:
    0 0 0 1px rgba(248, 113, 113, 0.4),
    0 0 18px rgba(248, 113, 113, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-orbit::before {
  content: "";
  position: absolute;
  inset: 6px;
  border-radius: inherit;
  border: 1px solid rgba(248, 250, 252, 0.6);
  opacity: 0.7;
}

.logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #f9fafb;
  box-shadow:
    0 0 14px rgba(239, 246, 255, 0.9),
    0 0 30px rgba(56, 189, 248, 0.8);
  animation: logo-pulse 2.4s ease-in-out infinite;
}

.title-group {
  display: flex;
  flex-direction: column;
}

.login-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: linear-gradient(to right, #fee2e2, #fb923c, #f97316);
  -webkit-background-clip: text;
  color: transparent;
}

.login-subtitle {
  margin-top: 4px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.9);
}

.btn-tech {
  position: relative;
  border-radius: 999px;
  border: none;
  background: radial-gradient(circle at 20% 20%, #fb923c, #ef4444);
  box-shadow:
    0 12px 30px rgba(127, 29, 29, 0.9),
    0 0 24px rgba(248, 113, 113, 0.8);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  overflow: hidden;
}

.btn-tech::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(248, 250, 252, 0.35),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.btn-tech:hover::before {
  transform: translateX(100%);
}

.btn-tech:hover {
  transform: translateY(-1px);
  box-shadow:
    0 18px 40px rgba(8, 47, 73, 0.85),
    0 0 36px rgba(56, 189, 248, 0.9);
}

.btn-tech:active {
  transform: translateY(0);
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.9),
    0 0 18px rgba(56, 189, 248, 0.7);
}

@keyframes orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbit-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

@keyframes logo-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 14px rgba(239, 246, 255, 0.9),
      0 0 30px rgba(56, 189, 248, 0.8);
  }
  50% {
    transform: scale(1.12);
    box-shadow:
      0 0 24px rgba(239, 246, 255, 1),
      0 0 50px rgba(56, 189, 248, 1);
  }
}

@media (max-width: 640px) {
  .login-content {
    padding: 16px;
  }

  .login-card {
    border-radius: 18px;
  }
}
</style>

