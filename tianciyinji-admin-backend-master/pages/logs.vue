<template>
  <div>
    <div class="page-header">
      <h2>日志管理</h2>
      <a-space>
        <a-select
          v-model:value="selectedLevel"
          placeholder="筛选日志级别"
          style="width: 150px"
          allowClear
          @change="fetchLogs"
        >
          <a-select-option value="info">信息</a-select-option>
          <a-select-option value="warn">警告</a-select-option>
          <a-select-option value="error">错误</a-select-option>
          <a-select-option value="debug">调试</a-select-option>
        </a-select>
        <a-button @click="fetchLogs">刷新</a-button>
      </a-space>
    </div>

    <a-table
      :dataSource="logs"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      rowKey="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'level'">
          <a-tag :color="getLevelColor(record.level)">
            {{ record.level.toUpperCase() }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'meta'">
          <a-button
            type="link"
            size="small"
            @click="showMeta(record)"
            v-if="record.meta"
          >
            查看详情
          </a-button>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="metaModalOpen"
      title="日志详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="级别">
          <a-tag :color="getLevelColor(selectedLog?.level)">
            {{ selectedLog?.level?.toUpperCase() }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="消息">
          {{ selectedLog?.message }}
        </a-descriptions-item>
        <a-descriptions-item label="用户ID">
          {{ selectedLog?.userId || "-" }}
        </a-descriptions-item>
        <a-descriptions-item label="IP地址">
          {{ selectedLog?.ip || "-" }}
        </a-descriptions-item>
        <a-descriptions-item label="User Agent">
          {{ selectedLog?.userAgent || "-" }}
        </a-descriptions-item>
        <a-descriptions-item label="元数据">
          <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">{{
            JSON.stringify(selectedLog?.meta, null, 2)
          }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatDate(selectedLog?.createdAt) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore Nuxt auto-import
definePageMeta({
  ssr: false, // 禁用 SSR，避免 Ant Design Vue 组件在服务端渲染时出错
});

import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useUserStore } from "../stores/user";
import { useApiFetch } from "../composables/useApiFetch";

// @ts-ignore Nuxt auto-import
useHead({
  title: "日志管理 - 天赐印记后台",
});

interface Log {
  id: number;
  level: string;
  message: string;
  meta?: any;
  userId?: number;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

const userStore = useUserStore();
const $api = useApiFetch();
const loading = ref(false);
const logs = ref<Log[]>([]);
const selectedLevel = ref<string | undefined>();
const metaModalOpen = ref(false);
const selectedLog = ref<Log | null>(null);

const pagination = reactive({
  current: 1,
  pageSize: 50,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
});

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
  },
  {
    title: "级别",
    dataIndex: "level",
    key: "level",
    width: 100,
  },
  {
    title: "消息",
    dataIndex: "message",
    key: "message",
    ellipsis: true,
  },
  {
    title: "用户ID",
    dataIndex: "userId",
    key: "userId",
    width: 100,
  },
  {
    title: "IP地址",
    dataIndex: "ip",
    key: "ip",
    width: 150,
  },
  {
    title: "元数据",
    key: "meta",
    width: 100,
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 180,
  },
];

const getLevelColor = (level?: string) => {
  switch (level?.toLowerCase()) {
    case "error":
      return "red";
    case "warn":
      return "orange";
    case "info":
      return "blue";
    case "debug":
      return "green";
    default:
      return "default";
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("zh-CN");
};

const showMeta = (log: Log) => {
  selectedLog.value = log;
  metaModalOpen.value = true;
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    if (selectedLevel.value) {
      params.level = selectedLevel.value;
    }

    const response = await $api<{
      statusCode: number;
      message: string;
      data: {
        data: Log[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
        };
      };
    }>("/api/logs", {
      method: "GET",
      query: params,
    });

    if (response.statusCode === 200) {
      logs.value = response.data.data;
      pagination.total = response.data.pagination.total;
    } else {
      message.error(response.message || "获取日志列表失败");
    }
  } catch (error: any) {
    console.error("获取日志列表失败:", error);
    message.error(error.message || "获取日志列表失败");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchLogs();
};

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header h2 {
    font-size: 18px;
  }

  :deep(.ant-table-wrapper) {
    overflow-x: auto;
  }

  :deep(.ant-table) {
    min-width: 800px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px;
    font-size: 12px;
  }

  :deep(.ant-space) {
    flex-wrap: wrap;
  }

  :deep(.ant-descriptions-item-label) {
    width: 80px;
  }
}
</style>
