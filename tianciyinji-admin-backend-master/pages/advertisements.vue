<template>
  <div>
    <div class="page-header">
      <h2>广告管理</h2>
      <a-button type="primary" @click="openCreate">新建广告</a-button>
    </div>

    <a-table
      :dataSource="ads"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      rowKey="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'imageUrl'">
          <a-image :src="record.imageUrl" :width="120" />
        </template>
        <template v-else-if="column.key === 'isVisible'">
          <a-tag :color="record.isVisible ? 'green' : 'red'">
            {{ record.isVisible ? "显示" : "隐藏" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该广告？"
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
      :title="editing ? '编辑广告' : '新建广告'"
      :width="isMobile ? '100%' : '720px'"
      :style="isMobile ? { top: 0, paddingBottom: 0 } : {}"
      :bodyStyle="isMobile ? { maxHeight: 'calc(100vh - 110px)', overflow: 'auto' } : {}"
      @ok="handleSubmit"
      :confirmLoading="saving"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model:value="form.title" />
        </a-form-item>
        <a-form-item label="图片地址" required>
          <a-input v-model:value="form.imageUrl" />
        </a-form-item>
        <a-form-item label="位置标识" required>
          <a-input v-model:value="form.position" />
        </a-form-item>
        <a-form-item label="描述">
          <a-input v-model:value="form.description" />
        </a-form-item>
        <a-form-item label="跳转链接">
          <a-input v-model:value="form.link" />
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
  title: "广告管理 - 天赐印记后台",
});

interface Advertisement {
  id: number;
  title: string;
  imageUrl: string;
  position: string;
  order: number;
  isVisible: boolean;
  description?: string;
  link?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdvertisementForm {
  title: string;
  imageUrl: string;
  position: string;
  order: number;
  isVisible: boolean;
  description?: string;
  link?: string;
}

const loading = ref(false);
const saving = ref(false);
const ads = ref<Advertisement[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { title: "ID", dataIndex: "id", key: "id", width: 60 },
  { title: "标题", dataIndex: "title", key: "title" },
  { title: "图片", dataIndex: "imageUrl", key: "imageUrl", width: 150 },
  { title: "位置", dataIndex: "position", key: "position", width: 120 },
  { title: "排序", dataIndex: "order", key: "order", width: 80 },
  { title: "显示", dataIndex: "isVisible", key: "isVisible", width: 80 },
  {
    title: "操作",
    key: "actions",
    width: 160,
  },
];

const emptyForm = (): AdvertisementForm => ({
  title: "",
  imageUrl: "",
  position: "",
  order: 0,
  isVisible: true,
  description: "",
  link: "",
});

const form = reactive<AdvertisementForm>(emptyForm());
const modalOpen = ref(false);
const editing = ref(false);
const editingId = ref<number | null>(null);

const $api = useApiFetch();

const fetchAds = async () => {
  try {
    loading.value = true;
    const res = await $api<{
      statusCode: number;
      data?: {
        data: Advertisement[];
        pagination: { current: number; pageSize: number; total: number; totalPages: number };
      };
      error?: string;
    }>("/api/advertisements", {
      query: { page: pagination.current },
    });

    if (res.statusCode === 200 && res.data) {
      ads.value = res.data.data;
      pagination.current = res.data.pagination.current;
      pagination.pageSize = res.data.pagination.pageSize;
      pagination.total = res.data.pagination.total;
    } else {
      message.error(res.error || "获取广告列表失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || "获取广告列表失败");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pager: any) => {
  pagination.current = pager.current;
  pagination.pageSize = pager.pageSize;
  fetchAds();
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

const openEdit = (record: Advertisement) => {
  editing.value = true;
  editingId.value = record.id;
  Object.assign(form, {
    title: record.title,
    imageUrl: record.imageUrl,
    position: record.position,
    order: record.order,
    isVisible: record.isVisible,
    description: record.description ?? "",
    link: record.link ?? "",
  });
  modalOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.title || !form.imageUrl || !form.position) {
    message.warning("标题、图片地址和位置为必填项");
    return;
  }

  const payload = { ...form };

  try {
    saving.value = true;
    if (editing.value && editingId.value != null) {
      const res = await $api<{
        statusCode: number;
        data?: Advertisement;
        error?: string;
      }>(`/api/advertisements/${editingId.value}`, {
        method: "PUT",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("更新成功");
        modalOpen.value = false;
        fetchAds();
      } else {
        message.error(res.error || "更新失败");
      }
    } else {
      const res = await $api<{
        statusCode: number;
        data?: Advertisement;
        error?: string;
      }>("/api/advertisements", {
        method: "POST",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("创建成功");
        modalOpen.value = false;
        fetchAds();
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
    }>(`/api/advertisements/${id}`, {
      method: "DELETE",
    });
    if (res.statusCode === 200 && res.message && !res.error) {
      message.success(res.message);
      fetchAds();
    } else {
      message.error(res.error || res.message || "删除失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || error?.data?.message || "删除失败");
  }
};

onMounted(() => {
  fetchAds();
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
    min-width: 800px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px;
    font-size: 12px;
  }

  :deep(.ant-image) {
    width: 60px !important;
    height: 45px;
    object-fit: cover;
  }

  :deep(.ant-space) {
    flex-wrap: wrap;
  }
}
</style>

