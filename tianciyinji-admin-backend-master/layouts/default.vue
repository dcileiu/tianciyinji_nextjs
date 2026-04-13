<template>
  <a-layout v-if="isClient" class="layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      breakpoint="lg"
      collapsed-width="0"
      class="sider"
      :width="256"
    >
      <div class="sider-content">
        <div class="logo">天赐印记后台</div>
        <div class="menu-wrapper">
          <a-menu
            theme="dark"
            mode="inline"
            :selectedKeys="[selectedKey]"
            @click="onMenuClick"
          >
            <a-menu-item key="/dashboard">仪表盘</a-menu-item>
            <a-menu-item key="/articles">文章管理</a-menu-item>
            <a-menu-item key="/categories">分类管理</a-menu-item>
            <a-menu-item key="/tags">标签管理</a-menu-item>
            <a-menu-item key="/banners">轮播图</a-menu-item>
            <a-menu-item key="/advertisements">广告管理</a-menu-item>
            <a-menu-item key="/tasks">任务管理</a-menu-item>
            <a-menu-item key="/logs">日志管理</a-menu-item>
            <a-menu-item key="/visits">访问记录</a-menu-item>
          </a-menu>
        </div>
      </div>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
        </div>
        <div class="header-right">
          <span class="user-name">{{ userStore.userInfo?.username }}</span>
          <a-button type="link" @click="handleLogout">退出登录</a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <slot />
      </a-layout-content>
    </a-layout>
  </a-layout>
  <div v-else style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "#imports";
import { useUserStore } from "../stores/user";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons-vue";
import { ref, computed, onMounted, onUnmounted } from "vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isClient = ref(false);
const collapsed = ref(false);

const selectedKey = computed(() =>
  route.path === "/" ? "/dashboard" : route.path,
);

const onMenuClick = (info: { key: string }) => {
  router.push(info.key);
  // 移动端点击菜单后自动折叠
  if (typeof window !== "undefined" && window.innerWidth < 992) {
    collapsed.value = true;
  }
};

const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};

const handleResize = () => {
  if (typeof window !== "undefined" && window.innerWidth < 992) {
    collapsed.value = true;
  }
};

onMounted(() => {
  isClient.value = true;
  if (typeof window !== "undefined") {
    if (window.innerWidth < 992) {
      collapsed.value = true;
    }
    window.addEventListener("resize", handleResize);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize);
  }
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  min-height: 100vh;
  z-index: 100;
  overflow: hidden;
}

@media (min-width: 992px) {
  .sider {
    position: relative;
  }
}

.sider-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.logo {
  height: 64px;
  min-height: 64px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  white-space: nowrap;
  flex-shrink: 0;
}

.menu-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.menu-wrapper::-webkit-scrollbar {
  width: 6px;
}

.menu-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.menu-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.menu-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.header {
  background: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 99;
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  padding: 0 12px;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-name {
  color: #333;
  white-space: nowrap;
}

.content {
  margin: 16px;
  padding: 16px;
  background: #fff;
  min-height: calc(100vh - 96px);
  transition: all 0.2s;
}

@media (min-width: 992px) {
  .content {
    margin-left: 0;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .header {
    padding: 0 12px;
  }

  .header-right {
    gap: 4px;
    font-size: 14px;
  }

  .user-name {
    font-size: 14px;
  }

  .content {
    margin: 8px;
    padding: 12px;
    min-height: calc(100vh - 80px);
  }

  .logo {
    font-size: 16px;
    padding: 0 8px;
  }
}

/* 平板优化 */
@media (min-width: 769px) and (max-width: 991px) {
  .content {
    margin: 12px;
    padding: 14px;
  }
}

</style>

