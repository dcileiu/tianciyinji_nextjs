<template>
  <div>
    <div class="page-header">
      <h2>任务管理</h2>
      <a-space>
        <a-select
          v-model:value="filterCompleted"
          placeholder="筛选状态"
          style="width: 120px"
          allowClear
          @change="fetchTasks"
        >
          <a-select-option :value="true">已完成</a-select-option>
          <a-select-option :value="false">未完成</a-select-option>
        </a-select>
        <a-button type="primary" @click="openCreate">新建任务</a-button>
      </a-space>
    </div>

    <a-table
      :dataSource="tasks"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      rowKey="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isCompleted'">
          <a-switch
            :checked="record.isCompleted === 1"
            @change="(checked) => toggleComplete(record.id, checked)"
          />
        </template>
        <template v-else-if="column.key === 'dueDate'">
          {{ record.dueDate ? formatDate(record.dueDate) : "-" }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该任务？"
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
      :title="editing ? '编辑任务' : '新建任务'"
      @ok="handleSubmit"
      :confirmLoading="saving"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="任务名称" required>
          <a-input v-model:value="form.name" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item label="任务描述">
          <a-textarea
            v-model:value="form.description"
            rows="4"
            placeholder="请输入任务描述"
          />
        </a-form-item>
        <a-form-item label="截止日期">
          <a-date-picker
            v-model:value="dueDateValue"
            show-time
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
          />
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
import { useUserStore } from "../stores/user";
import dayjs, { Dayjs } from "dayjs";
import { useApiFetch } from "../composables/useApiFetch";

// @ts-ignore Nuxt auto-import
useHead({
  title: "任务管理 - 天赐印记后台",
});

interface Task {
  id: number;
  name: string;
  description?: string;
  isCompleted: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskForm {
  name: string;
  description?: string;
  dueDate?: string;
}

const userStore = useUserStore();
const $api = useApiFetch();
const loading = ref(false);
const saving = ref(false);
const tasks = ref<Task[]>([]);
const modalOpen = ref(false);
const editing = ref(false);
const currentId = ref<number | null>(null);
const filterCompleted = ref<boolean | undefined>();
const dueDateValue = ref<Dayjs | null>(null);

const form = reactive<TaskForm>({
  name: "",
  description: "",
  dueDate: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
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
    title: "任务名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "描述",
    dataIndex: "description",
    key: "description",
    ellipsis: true,
  },
  {
    title: "完成状态",
    key: "isCompleted",
    width: 120,
  },
  {
    title: "截止日期",
    dataIndex: "dueDate",
    key: "dueDate",
    width: 180,
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 180,
  },
  {
    title: "操作",
    key: "actions",
    width: 150,
  },
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
};

const fetchTasks = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    if (filterCompleted.value !== undefined) {
      params.isCompleted = filterCompleted.value;
    }

    const response = await $api<{
      statusCode: number;
      message: string;
      data: {
        data: Task[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
        };
      };
    }>("/api/tasks", {
      method: "GET",
      query: params,
    });

    if (response.statusCode === 200) {
      tasks.value = response.data.data;
      pagination.total = response.data.pagination.total;
    } else {
      message.error(response.message || "获取任务列表失败");
    }
  } catch (error: any) {
    console.error("获取任务列表失败:", error);
    message.error(error.message || "获取任务列表失败");
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editing.value = false;
  currentId.value = null;
  form.name = "";
  form.description = "";
  form.dueDate = undefined;
  dueDateValue.value = null;
  modalOpen.value = true;
};

const openEdit = (task: Task) => {
  editing.value = true;
  currentId.value = task.id;
  form.name = task.name;
  form.description = task.description || "";
  form.dueDate = task.dueDate;
  dueDateValue.value = task.dueDate ? dayjs(task.dueDate) : null;
  modalOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.name.trim()) {
    message.warning("请输入任务名称");
    return;
  }

  saving.value = true;
  try {
    const payload: any = {
      name: form.name,
      description: form.description || undefined,
    };

    if (dueDateValue.value) {
      payload.dueDate = dueDateValue.value.format("YYYY-MM-DD HH:mm:ss");
    }

    const url = editing.value
      ? `/api/tasks/${currentId.value}`
      : "/api/tasks";
    const method = editing.value ? "PUT" : "POST";

    const response = await $api<{
      statusCode: number;
      message: string;
    }>(url, {
      method,
      body: payload,
    });

    if (response.statusCode === 200) {
      message.success(response.message);
      modalOpen.value = false;
      fetchTasks();
    } else {
      message.error(response.message || "操作失败");
    }
  } catch (error: any) {
    console.error("操作失败:", error);
    message.error(error.message || "操作失败");
  } finally {
    saving.value = false;
  }
};

const toggleComplete = async (id: number, checked: boolean) => {
  try {
    const response = await $api<{
      statusCode: number;
      message: string;
    }>(`/api/tasks/${id}`, {
      method: "PUT",
      body: {
        isCompleted: checked,
      },
    });

    if (response.statusCode === 200) {
      message.success("更新成功");
      fetchTasks();
    } else {
      message.error(response.message || "更新失败");
    }
  } catch (error: any) {
    console.error("更新失败:", error);
    message.error(error.message || "更新失败");
  }
};

const handleDelete = async (id: number) => {
  try {
    const response = await $api<{
      statusCode: number;
      message: string;
    }>(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (response.statusCode === 200) {
      message.success("删除成功");
      fetchTasks();
    } else {
      message.error(response.message || "删除失败");
    }
  } catch (error: any) {
    console.error("删除失败:", error);
    message.error(error.message || "删除失败");
  }
};

const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchTasks();
};

onMounted(() => {
  fetchTasks();
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

  :deep(.ant-space) {
    flex-wrap: wrap;
  }
}
</style>
