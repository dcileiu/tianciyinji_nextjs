<template>
  <div>
    <div class="page-header">
      <h2>轮播图管理</h2>
      <a-button type="primary" @click="openCreate">新建轮播图</a-button>
    </div>

    <a-table
      :dataSource="banners"
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
              title="确定删除该轮播图？"
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
      :title="editing ? '编辑轮播图' : '新建轮播图'"
      :width="isMobile ? '100%' : '720px'"
      :style="isMobile ? { top: 0, paddingBottom: 0 } : {}"
      :bodyStyle="isMobile ? { maxHeight: 'calc(100vh - 110px)', overflow: 'auto' } : {}"
      @ok="handleSubmit"
      :confirmLoading="saving"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="图片地址" required>
          <a-input v-model:value="form.imageUrl" />
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model:value="form.title" />
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
  title: "轮播图管理 - 天赐印记后台",
});

interface Banner {
  id: number;
  imageUrl: string;
  isVisible: boolean;
  order: number;
  title?: string;
  description?: string;
  link?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface BannerForm {
  imageUrl: string;
  isVisible: boolean;
  order: number;
  title?: string;
  description?: string;
  link?: string;
}

const loading = ref(false);
const saving = ref(false);
const banners = ref<Banner[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { title: "ID", dataIndex: "id", key: "id", width: 60 },
  { title: "图片", dataIndex: "imageUrl", key: "imageUrl", width: 150 },
  { title: "标题", dataIndex: "title", key: "title" },
  { title: "排序", dataIndex: "order", key: "order", width: 80 },
  { title: "显示", dataIndex: "isVisible", key: "isVisible", width: 80 },
  {
    title: "操作",
    key: "actions",
    width: 160,
  },
];

const emptyForm = (): BannerForm => ({
  imageUrl: "",
  isVisible: true,
  order: 0,
  title: "",
  description: "",
  link: "",
});

const form = reactive<BannerForm>(emptyForm());
const modalOpen = ref(false);
const editing = ref(false);
const editingId = ref<number | null>(null);

const $api = useApiFetch();

const fetchBanners = async () => {
  try {
    loading.value = true;
    const res = await $api<{
      statusCode: number;
      data?: {
        data: Banner[];
        pagination: { current: number; pageSize: number; total: number; totalPages: number };
      };
      error?: string;
    }>("/api/banners", {
      query: { page: pagination.current },
    });

    if (res.statusCode === 200 && res.data) {
      banners.value = res.data.data;
      pagination.current = res.data.pagination.current;
      pagination.pageSize = res.data.pagination.pageSize;
      pagination.total = res.data.pagination.total;
    } else {
      message.error(res.error || "获取轮播图列表失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || "获取轮播图列表失败");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pager: any) => {
  pagination.current = pager.current;
  pagination.pageSize = pager.pageSize;
  fetchBanners();
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

const openEdit = (record: Banner) => {
  editing.value = true;
  editingId.value = record.id;
  Object.assign(form, {
    imageUrl: record.imageUrl,
    isVisible: record.isVisible,
    order: record.order,
    title: record.title ?? "",
    description: record.description ?? "",
    link: record.link ?? "",
  });
  modalOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.imageUrl) {
    message.warning("图片地址为必填项");
    return;
  }

  const payload = { ...form };

  try {
    saving.value = true;
    if (editing.value && editingId.value != null) {
      const res = await $api<{
        statusCode: number;
        data?: Banner;
        error?: string;
      }>(`/api/banners/${editingId.value}`, {
        method: "PUT",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("更新成功");
        modalOpen.value = false;
        fetchBanners();
      } else {
        message.error(res.error || "更新失败");
      }
    } else {
      const res = await $api<{
        statusCode: number;
        data?: Banner;
        error?: string;
      }>("/api/banners", {
        method: "POST",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("创建成功");
        modalOpen.value = false;
        fetchBanners();
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
    }>(`/api/banners/${id}`, {
      method: "DELETE",
    });
    if (res.statusCode === 200 && res.message && !res.error) {
      message.success(res.message);
      fetchBanners();
    } else {
      message.error(res.error || res.message || "删除失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || error?.data?.message || "删除失败");
  }
};

onMounted(() => {
  fetchBanners();
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

