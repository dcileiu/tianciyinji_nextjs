<template>
  <div>
    <div class="page-header">
      <h2>标签管理</h2>
      <a-button type="primary" @click="openCreate">新建标签</a-button>
    </div>

    <a-table
      :dataSource="tags"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      rowKey="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isVisible'">
          <a-tag :color="record.isVisible ? 'green' : 'red'">
            {{ record.isVisible ? "显示" : "隐藏" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该标签？"
              ok-text="是"
              cancel-text="否"
              @confirm="() => handleDelete(record.id)"
            >
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑标签' : '新建标签'"
      :width="isMobile ? '100%' : '600px'"
      :style="isMobile ? { top: 0, paddingBottom: 0 } : {}"
      :bodyStyle="isMobile ? { maxHeight: 'calc(100vh - 110px)', overflow: 'auto' } : {}"
      @ok="handleSubmit"
      :confirmLoading="saving"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" />
        </a-form-item>
        <a-form-item label="Key" required>
          <a-input v-model:value="form.key" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="form.order" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="是否显示">
          <a-switch v-model:checked="form.isVisible" />
        </a-form-item>
      </a-form>
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
import { useApiFetch } from "../composables/useApiFetch";
import { useMobile } from "../composables/useMobile";

const { isMobile } = useMobile();

// @ts-ignore Nuxt auto-import
useHead({
  title: "标签管理 - 天赐印记后台",
});

interface Tag {
  id: number;
  title: string;
  key: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TagForm {
  title: string;
  key: string;
  order: number;
  isVisible: boolean;
}

const loading = ref(false);
const saving = ref(false);
const tags = ref<Tag[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

const columns = [
  { title: "ID", dataIndex: "id", key: "id", width: 60 },
  { title: "标题", dataIndex: "title", key: "title" },
  { title: "Key", dataIndex: "key", key: "key" },
  { title: "排序", dataIndex: "order", key: "order", width: 80 },
  { title: "显示", dataIndex: "isVisible", key: "isVisible", width: 80 },
  {
    title: "操作",
    key: "actions",
    width: 160,
  },
];

const emptyForm = (): TagForm => ({
  title: "",
  key: "",
  order: 0,
  isVisible: true,
});

const form = reactive<TagForm>(emptyForm());
const modalOpen = ref(false);
const editing = ref(false);
const editingId = ref<number | null>(null);

const $api = useApiFetch();

const fetchTags = async () => {
  try {
    loading.value = true;
    const res = await $api<{
      statusCode: number;
      data?: {
        data: Tag[];
        pagination: {
          current: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      };
      error?: string;
    }>("/api/tags", {
      query: {
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    });

    if (res.statusCode === 200 && res.data) {
      tags.value = res.data.data;
      pagination.total = res.data.pagination.total;
      pagination.current = res.data.pagination.current;
      pagination.pageSize = res.data.pagination.pageSize;
    } else {
      message.error(res.error || "获取标签列表失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || "获取标签列表失败");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchTags();
};

const resetForm = () => {
  Object.assign(form, emptyForm());
};

const openCreate = () => {
  editing.value = false;
  editingId.value = null;
  resetForm();
  modalOpen.value = true;
};

const openEdit = (record: Tag) => {
  editing.value = true;
  editingId.value = record.id;
  Object.assign(form, {
    title: record.title,
    key: record.key,
    order: record.order,
    isVisible: record.isVisible,
  });
  modalOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.title || !form.key) {
    message.warning("标题和 key 为必填项");
    return;
  }

  const payload = { ...form };

  try {
    saving.value = true;
    if (editing.value && editingId.value != null) {
      const res = await $api<{
        statusCode: number;
        data?: Tag;
        error?: string;
      }>(`/api/tags/${editingId.value}`, {
        method: "PUT",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("更新成功");
        modalOpen.value = false;
        fetchTags();
      } else {
        message.error(res.error || "更新失败");
      }
    } else {
      const res = await $api<{
        statusCode: number;
        data?: Tag;
        error?: string;
      }>("/api/tags", {
        method: "POST",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("创建成功");
        modalOpen.value = false;
        fetchTags();
      } else {
        message.error(res.error || "创建失败");
      }
    }
  } catch (error: any) {
    message.error(error?.data?.error || "保存失败");
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id: number) => {
  try {
    const res = await $api<{
      statusCode: number;
      message?: string;
      error?: string;
    }>(`/api/tags/${id}`, {
      method: "DELETE",
    });
    if (res.statusCode === 200 && res.message && !res.error) {
      message.success(res.message);
      fetchTags();
    } else {
      message.error(res.error || res.message || "删除失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || error?.data?.message || "删除失败");
  }
};

onMounted(() => {
  fetchTags();
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header h2 {
    font-size: 18px;
    margin: 0;
  }

  :deep(.ant-table-wrapper) {
    overflow-x: auto;
  }

  :deep(.ant-table) {
    min-width: 600px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px;
    font-size: 12px;
  }

  :deep(.ant-space) {
    flex-wrap: wrap;
  }
}
</style>

