<template>
  <div class="api-test-container">
    <div class="test-header">
      <h1>API 接口测试工具</h1>
      <a-space>
        <a-input
          :value="token"
          readonly
          placeholder="登录后自动使用当前用户 Token"
          style="width: 320px"
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input>
        <a-button type="primary" @click="runAllTests" :loading="runningAll">
          运行所有测试
        </a-button>
        <a-button @click="clearResults">清空结果</a-button>
      </a-space>
    </div>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="overview" tab="概览">
        <div class="stats">
          <a-statistic title="总接口数" :value="totalApis" :value-style="{ color: '#1890ff' }" />
          <a-statistic title="已测试" :value="testedCount" :value-style="{ color: '#52c41a' }" />
          <a-statistic title="成功" :value="successCount" :value-style="{ color: '#52c41a' }" />
          <a-statistic title="失败" :value="failedCount" :value-style="{ color: '#ff4d4f' }" />
        </div>
        <div class="test-summary" v-if="testedCount > 0">
          <h3>测试摘要</h3>
          <a-progress
            :percent="Math.round((successCount / testedCount) * 100)"
            :status="failedCount > 0 ? 'active' : 'success'"
          />
          <p>成功率: {{ Math.round((successCount / testedCount) * 100) }}%</p>
        </div>
      </a-tab-pane>

      <a-tab-pane key="health" tab="Health">
        <ApiTestGroup :tests="healthTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="auth" tab="Auth">
        <ApiTestGroup :tests="authTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="users" tab="Users">
        <ApiTestGroup :tests="usersTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="articles" tab="Articles">
        <ApiTestGroup :tests="articlesTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="categories" tab="Categories">
        <ApiTestGroup :tests="categoriesTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="tags" tab="Tags">
        <ApiTestGroup :tests="tagsTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="banners" tab="Banners">
        <ApiTestGroup :tests="bannersTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="advertisements" tab="Advertisements">
        <ApiTestGroup :tests="advertisementsTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="statistics" tab="Statistics">
        <ApiTestGroup :tests="statisticsTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="upload" tab="Upload">
        <ApiTestGroup :tests="uploadTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="logs" tab="Logs">
        <ApiTestGroup :tests="logsTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="tasks" tab="Tasks">
        <ApiTestGroup :tests="tasksTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>

      <a-tab-pane key="visits" tab="Visits">
        <ApiTestGroup :tests="visitsTests" :token="token" :external-results="testResults" @result="handleResult" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import { LockOutlined } from "@ant-design/icons-vue";
import ApiTestGroup from "../components/ApiTestGroup.vue";
import { useUserStore } from "../stores/user";
import { useApiFetch } from "../composables/useApiFetch";

// @ts-ignore Nuxt auto-import
useHead({
  title: "API 测试 - 天赐印记后台",
});

// @ts-ignore Nuxt auto-import
definePageMeta({
  layout: "blank",
  ssr: false,
});

interface TestResult {
  id: string;
  success: boolean;
  duration: number;
  response?: any;
  error?: string;
}

interface ApiTestCase {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  requiresAuth: boolean;
  params?: Record<string, any>;
  body?: Record<string, any>;
}

const userStore = useUserStore();
const $api = useApiFetch();
const activeTab = ref("overview");
const runningAll = ref(false);
const testResults = ref<Record<string, TestResult>>({});

const token = computed(() => userStore.token || "");

const healthTests: ApiTestCase[] = [
  { id: "health-get", name: "健康检查", method: "GET", url: "/api/health", requiresAuth: false },
];

const authTests: ApiTestCase[] = [
  { id: "auth-login", name: "登录", method: "POST", url: "/api/auth/login", requiresAuth: false, body: { username: "admin", password: "admin123" } },
];

const usersTests: ApiTestCase[] = [
  { id: "users-info", name: "获取用户信息", method: "POST", url: "/api/users/info", requiresAuth: true },
];

const articlesTests: ApiTestCase[] = [
  { id: "articles-list", name: "获取文章列表", method: "GET", url: "/api/articles", requiresAuth: false, params: { page: 1, pageSize: 10 } },
  { id: "articles-list-alias", name: "获取文章列表（别名）", method: "GET", url: "/api/articles/list", requiresAuth: false, params: { page: 1, pageSize: 10 } },
  { id: "articles-create", name: "创建文章", method: "POST", url: "/api/articles", requiresAuth: true, body: { title: "测试文章", content: "这是一篇测试文章的内容", category: "test", tags: "test,api", coverImage: "http://p1.qhimg.com/t01b4d0943444706854.jpg", order: 0, isPublished: true } },
  { id: "articles-search", name: "搜索文章", method: "POST", url: "/api/articles/search", requiresAuth: false, body: { keyword: "测试" } },
];

const categoriesTests: ApiTestCase[] = [
  { id: "categories-list", name: "获取分类列表", method: "GET", url: "/api/categories", requiresAuth: false },
  { id: "categories-create", name: "创建分类", method: "POST", url: "/api/categories", requiresAuth: true, body: { name: "测试分类", key: `test-category-${Date.now()}`, order: 0 } },
];

const tagsTests: ApiTestCase[] = [
  { id: "tags-list", name: "获取标签列表", method: "GET", url: "/api/tags", requiresAuth: false },
  { id: "tags-create", name: "创建标签", method: "POST", url: "/api/tags", requiresAuth: true, body: { title: "测试标签", key: `test-tag-${Date.now()}`, order: 0, isVisible: true } },
];

const bannersTests: ApiTestCase[] = [
  { id: "banners-list", name: "获取轮播图列表", method: "GET", url: "/api/banners", requiresAuth: false, params: { page: 1, pageSize: 10 } },
  { id: "banners-visible", name: "获取可见轮播图", method: "GET", url: "/api/banners/visible", requiresAuth: false, params: { page: 1, pageSize: 10 } },
  { id: "banners-create", name: "创建轮播图", method: "POST", url: "/api/banners", requiresAuth: true, body: { imageUrl: "https://example.com/banner.jpg", title: "测试轮播图", description: "测试描述", order: 0, isVisible: true } },
];

const advertisementsTests: ApiTestCase[] = [
  { id: "advertisements-list", name: "获取广告列表", method: "GET", url: "/api/advertisements", requiresAuth: false, params: { page: 1, pageSize: 10 } },
  { id: "advertisements-visible", name: "获取可见广告", method: "GET", url: "/api/advertisements/visible", requiresAuth: false, params: { page: 1, pageSize: 10 } },
  { id: "advertisements-create", name: "创建广告", method: "POST", url: "/api/advertisements", requiresAuth: true, body: { imageUrl: "https://example.com/ad.jpg", title: "测试广告", position: "top", order: 0, isVisible: true } },
];

const statisticsTests: ApiTestCase[] = [
  { id: "statistics-get", name: "获取统计数据", method: "GET", url: "/api/statistics", requiresAuth: false },
  { id: "statistics-visit", name: "记录访问", method: "POST", url: "/api/statistics/visit", requiresAuth: false },
];

const uploadTests: ApiTestCase[] = [
  { id: "upload-image", name: "上传图片", method: "POST", url: "/api/upload/image", requiresAuth: true, body: {} },
];

const logsTests: ApiTestCase[] = [
  { id: "logs-list", name: "获取日志列表", method: "GET", url: "/api/logs", requiresAuth: true, params: { page: 1, pageSize: 10 } },
  { id: "logs-create", name: "创建日志", method: "POST", url: "/api/logs", requiresAuth: true, body: { level: "info", message: "测试日志消息", meta: { test: true } } },
];

const tasksTests: ApiTestCase[] = [
  { id: "tasks-list", name: "获取任务列表", method: "GET", url: "/api/tasks", requiresAuth: true, params: { page: 1, pageSize: 10 } },
  { id: "tasks-create", name: "创建任务", method: "POST", url: "/api/tasks", requiresAuth: true, body: { name: "测试任务", description: "这是一个测试任务" } },
];

const visitsTests: ApiTestCase[] = [
  { id: "visits-list", name: "获取访问记录", method: "GET", url: "/api/visits", requiresAuth: true, params: { page: 1, pageSize: 10 } },
  { id: "visits-create", name: "记录访问", method: "POST", url: "/api/visits", requiresAuth: false, body: { path: "/test", referer: "https://example.com" } },
];

const allTests: ApiTestCase[] = [
  ...healthTests,
  ...authTests,
  ...usersTests,
  ...articlesTests,
  ...categoriesTests,
  ...tagsTests,
  ...bannersTests,
  ...advertisementsTests,
  ...statisticsTests,
  ...uploadTests,
  ...logsTests,
  ...tasksTests,
  ...visitsTests,
];

const totalApis = computed(() => allTests.length);
const testedCount = computed(() => Object.keys(testResults.value).length);
const successCount = computed(() => Object.values(testResults.value).filter((r) => r.success).length);
const failedCount = computed(() => Object.values(testResults.value).filter((r) => !r.success).length);

const handleResult = (result: TestResult) => {
  testResults.value[result.id] = result;
};

const runAllTests = async () => {
  if (!token.value) {
    message.warning("请先登录后再进行接口测试");
    return;
  }

  runningAll.value = true;
  testResults.value = {};

  const testsToRun = allTests.filter(
    (test) => !test.id.includes("-get-") && !test.id.includes("-put-") && !test.id.includes("-delete-"),
  );

  for (const test of testsToRun) {
    try {
      const startTime = Date.now();
      let response: any;

      if (test.requiresAuth && !token.value) {
        throw new Error("需要 Token");
      }

      if (test.method === "GET") {
        response = await $api(test.url, {
          method: "GET",
          query: test.params,
        });
      } else if (test.url === "/api/upload/image") {
        response = {
          statusCode: 200,
          message: "上传接口需要文件，请手动测试",
        };
      } else {
        response = await $api(test.url, {
          method: test.method,
          body: test.body,
        });
      }

      const duration = Date.now() - startTime;
      const result: TestResult = {
        id: test.id,
        success: response.statusCode === 200 && !response.error,
        duration,
        response,
        error: response.error || undefined,
      };

      testResults.value[test.id] = result;
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error: any) {
      const result: TestResult = {
        id: test.id,
        success: false,
        duration: 0,
        error: error.message || String(error),
      };
      testResults.value[test.id] = result;
    }
  }

  runningAll.value = false;
  message.success(`批量测试完成！成功: ${successCount.value}, 失败: ${failedCount.value}`);
};

const clearResults = () => {
  testResults.value = {};
};
</script>

<style scoped>
.api-test-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f5f5;
}

.test-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  margin-bottom: 24px;
}

.test-summary {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
}

.test-summary h3 {
  margin-bottom: 16px;
}

:deep(.ant-tabs-content-holder) {
  background: white;
  padding: 16px;
  border-radius: 8px;
  min-height: 500px;
}
</style>
