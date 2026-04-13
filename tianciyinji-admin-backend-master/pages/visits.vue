<template>
  <div>
    <div class="page-header">
      <h2>访问记录</h2>
      <a-button @click="fetchVisits">刷新</a-button>
    </div>

    <a-table
      :dataSource="visits"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      rowKey="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'createdAt'">
          {{ formatDate(record.createdAt) }}
        </template>
        <template v-else-if="column.key === 'userAgent'">
          <a-tooltip :title="record.userAgent">
            <span style="max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ record.userAgent || "-" }}
            </span>
          </a-tooltip>
        </template>
      </template>
    </a-table>
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
import dayjs from "dayjs";
import { useApiFetch } from "../composables/useApiFetch";

// @ts-ignore Nuxt auto-import
useHead({
  title: "访问记录 - 天赐印记后台",
});

interface Visit {
  id: number;
  ip?: string;
  userAgent?: string;
  referer?: string;
  path?: string;
  createdAt: string;
}

const userStore = useUserStore();
const $api = useApiFetch();
const loading = ref(false);
const visits = ref<Visit[]>([]);

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
    title: "IP地址",
    dataIndex: "ip",
    key: "ip",
    width: 150,
  },
  {
    title: "访问路径",
    dataIndex: "path",
    key: "path",
    width: 200,
  },
  {
    title: "来源",
    dataIndex: "referer",
    key: "referer",
    ellipsis: true,
  },
  {
    title: "User Agent",
    dataIndex: "userAgent",
    key: "userAgent",
    width: 200,
  },
  {
    title: "访问时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 180,
  },
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
};

const fetchVisits = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
    };

    const response = await $api<{
      statusCode: number;
      message: string;
      data: {
        data: Visit[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
        };
      };
    }>("/api/visits", {
      method: "GET",
      query: params,
    });

    if (response.statusCode === 200) {
      visits.value = response.data.data;
      pagination.total = response.data.pagination.total;
    } else {
      message.error(response.message || "获取访问记录失败");
    }
  } catch (error: any) {
    console.error("获取访问记录失败:", error);
    message.error(error.message || "获取访问记录失败");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchVisits();
};

onMounted(() => {
  fetchVisits();
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
    min-width: 700px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px;
    font-size: 12px;
  }
}
</style>
