<template>
  <div class="api-test-group">
    <a-table
      :dataSource="tests"
      :columns="columns"
      :pagination="false"
      rowKey="id"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag
            v-if="results[record.id]"
            :color="results[record.id].success ? 'green' : 'red'"
          >
            {{ results[record.id].success ? "成功" : "失败" }}
          </a-tag>
          <span v-else class="text-muted">未测试</span>
        </template>
        <template v-else-if="column.key === 'duration'">
          <span v-if="results[record.id]">
            {{ results[record.id].duration }}ms
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button
              type="link"
              size="small"
              @click="runTest(record)"
              :loading="loading[record.id]"
            >
              测试
            </a-button>
            <a-button
              type="link"
              size="small"
              @click="showDetails(record)"
              v-if="results[record.id]"
            >
              详情
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="detailModalOpen"
      title="测试详情"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedResult">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="接口名称">
            {{ selectedTest?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="请求方法">
            <a-tag :color="getMethodColor(selectedTest?.method)">
              {{ selectedTest?.method }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="请求URL">
            {{ selectedTest?.url }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag
              :color="selectedResult.success ? 'green' : 'red'"
            >
              {{ selectedResult.success ? "成功" : "失败" }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="响应时间">
            {{ selectedResult.duration }}ms
          </a-descriptions-item>
          <a-descriptions-item label="响应数据">
            <pre class="response-pre">{{
              JSON.stringify(selectedResult.response, null, 2)
            }}</pre>
          </a-descriptions-item>
          <a-descriptions-item label="错误信息" v-if="selectedResult.error">
            <span style="color: red">{{ selectedResult.error }}</span>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { message } from "ant-design-vue";
import { useApiFetch } from "../composables/useApiFetch";

interface TestCase {
  id: string;
  name: string;
  method: string;
  url: string;
  requiresAuth?: boolean;
  params?: Record<string, any>;
  body?: Record<string, any>;
}

interface TestResult {
  id: string;
  success: boolean;
  duration: number;
  response?: any;
  error?: string;
}

const props = defineProps<{
  tests: TestCase[];
  token?: string;
  externalResults?: Record<string, TestResult>;
}>();

const emit = defineEmits<{
  result: [result: TestResult];
}>();

const $api = useApiFetch();
const loading = reactive<Record<string, boolean>>({});
const results = reactive<Record<string, TestResult>>({});
const detailModalOpen = ref(false);
const selectedResult = ref<TestResult | null>(null);
const selectedTest = ref<TestCase | null>(null);

// 监听外部结果变化
watch(
  () => props.externalResults,
  (newResults) => {
    if (newResults) {
      Object.assign(results, newResults);
    }
  },
  { deep: true, immediate: true },
);

const columns = [
  {
    title: "接口名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "方法",
    dataIndex: "method",
    key: "method",
    width: 100,
  },
  {
    title: "URL",
    dataIndex: "url",
    key: "url",
    ellipsis: true,
  },
  {
    title: "状态",
    key: "status",
    width: 100,
  },
  {
    title: "响应时间",
    key: "duration",
    width: 120,
  },
  {
    title: "操作",
    key: "actions",
    width: 150,
  },
];

const getMethodColor = (method?: string) => {
  switch (method?.toUpperCase()) {
    case "GET":
      return "blue";
    case "POST":
      return "green";
    case "PUT":
      return "orange";
    case "DELETE":
      return "red";
    default:
      return "default";
  }
};

const runTest = async (test: TestCase) => {
  loading[test.id] = true;

  const startTime = Date.now();

  try {
    // 检查是否需要认证
    if (test.requiresAuth && !props.token) {
      throw new Error("此接口需要 Token，请先设置 Token");
    }

    let response: any;

    if (test.method === "GET") {
      response = await $api(test.url, {
        method: "GET",
        query: test.params,
      });
    } else {
      // 特殊处理上传接口
      if (test.url === "/api/upload/image") {
        // 上传接口需要 FormData，这里跳过或使用模拟数据
        response = {
          statusCode: 200,
          message: "上传接口需要文件，请在页面中手动测试",
          note: "此接口需要 FormData，无法在此处自动测试",
        };
      } else {
        response = await $api(test.url, {
          method: test.method,
          body: test.body,
        });
      }
    }

    const duration = Date.now() - startTime;
    const result: TestResult = {
      id: test.id,
      success: response.statusCode === 200 && !response.error,
      duration,
      response,
      error: response.error || undefined,
    };

    results[test.id] = result;
    emit("result", result);

    if (result.success) {
      message.success(`${test.name} 测试成功`);
    } else {
      message.error(`${test.name} 测试失败: ${result.error || "未知错误"}`);
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const result: TestResult = {
      id: test.id,
      success: false,
      duration,
      error: error.message || String(error),
    };

    results[test.id] = result;
    emit("result", result);
    message.error(`${test.name} 测试失败: ${result.error}`);
  } finally {
    loading[test.id] = false;
  }
};

const showDetails = (test: TestCase) => {
  selectedTest.value = test;
  selectedResult.value = results[test.id] || null;
  detailModalOpen.value = true;
};
</script>

<style scoped>
.api-test-group {
  background: white;
}

.text-muted {
  color: #999;
}

.response-pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
</style>
