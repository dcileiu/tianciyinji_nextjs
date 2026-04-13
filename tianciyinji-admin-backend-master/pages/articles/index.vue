<template>
  <div>
    <div class="page-header">
      <h2>文章管理</h2>
      <a-button type="primary" @click="openCreate">新建文章</a-button>
    </div>

    <a-table
      :dataSource="articles"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      rowKey="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'coverImage'">
          <a-image :src="record.coverImage" :width="120" />
        </template>
        <template v-else-if="column.key === 'tags'">
          <a-tag v-for="tag in record.tags" :key="tag">{{ tag }}</a-tag>
        </template>
        <template v-else-if="column.key === 'isPublished'">
          <a-tag :color="record.isPublished ? 'green' : 'orange'">
            {{ record.isPublished ? "已发布" : "草稿" }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该文章？"
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
      :title="editing ? '编辑文章' : '新建文章'"
      :width="isMobile ? '100%' : '1200px'"
      :style="isMobile ? { top: 0, paddingBottom: 0 } : {}"
      :bodyStyle="isMobile ? { maxHeight: 'calc(100vh - 110px)', overflow: 'auto' } : {}"
      @ok="handleSubmit"
      :confirmLoading="saving"
    >
      <a-form :model="form" layout="vertical">
            <a-row :gutter="24">
              <a-col :xs="24" :md="18">
            <a-form-item label="标题" required>
              <a-input v-model:value="form.title" placeholder="请输入文章标题" />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12" :md="8">
                <a-form-item label="分类" required>
                  <a-select
                    v-model:value="form.category"
                    placeholder="请选择分类"
                    :options="categoryOptions"
                    :loading="categoriesLoading"
                  />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12" :md="16">
                <a-form-item label="标签">
                  <a-select
                    v-model:value="form.tags"
                    mode="tags"
                    placeholder="请输入或选择标签"
                    :options="tagOptions"
                    :loading="tagsLoading"
                    @change="handleTagChange"
                  >
                    <template #dropdownRender="{ menuNode }">
                      <div>
                        <component :is="menuNode" />
                        <a-divider style="margin: 8px 0" />
                        <div
                          style="padding: 0 8px 8px; cursor: pointer"
                          @mousedown="(e) => e.preventDefault()"
                          @click="openTagModal"
                        >
                          <plus-outlined />
                          <span style="margin-left: 8px">新建标签</span>
                        </div>
                      </div>
                    </template>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="排序">
                  <a-input-number v-model:value="form.order" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="16">
                <a-form-item label="状态">
                  <a-checkbox v-model:checked="form.isPublished">立即发布</a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
          </a-col>

          <a-col :span="6">
            <a-form-item label="封面图">
              <div class="cover-upload">
                <div v-if="form.coverImage" class="cover-preview" @click="previewVisible = true">
                  <img :src="form.coverImage" alt="封面图" />
                  <div class="cover-actions">
                    <delete-outlined class="delete-icon" @click.stop="removeCover" />
                  </div>
                </div>
                <a-upload
                  v-else
                  name="file"
                  list-type="picture-card"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  :customRequest="customUpload"
                >
                  <div v-if="uploadLoading">
                    <loading-outlined />
                  </div>
                  <div v-else>
                    <plus-outlined />
                    <div style="margin-top: 4px">上传封面</div>
                  </div>
                </a-upload>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="内容">
          <MdEditor v-model="form.content" :toolbars="mdToolbars" :preview="true" />
        </a-form-item>
      </a-form>

      <a-modal v-model:open="previewVisible" :footer="null" @cancel="previewVisible = false">
        <img style="width: 100%" :src="form.coverImage" alt="封面预览" />
      </a-modal>

      <a-modal
        v-model:open="tagModalVisible"
        title="新建标签"
        @ok="handleTagModalOk"
        :confirmLoading="tagModalLoading"
      >
        <a-form ref="tagFormRef" :model="tagForm" :rules="tagRules" layout="vertical">
          <a-form-item label="标签名称" name="title">
            <a-input v-model:value="tagForm.title" placeholder="请输入标签名称" />
          </a-form-item>
          <a-form-item label="标签标识" name="key">
            <a-input v-model:value="tagForm.key" placeholder="请输入标签标识" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore Nuxt auto-import
definePageMeta({
  ssr: false,
});

import { ref, reactive, onMounted } from "vue";
import type { FormInstance } from "ant-design-vue";
import { message } from "ant-design-vue";
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { useMobile } from "../../composables/useMobile";

// @ts-ignore Nuxt auto-import
useHead({
  title: "文章管理 - 天赐印记后台",
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore md-editor-v3 类型在某些环境下解析失败
import { MdEditor, config } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { useUserStore } from "../../stores/user";
import { useApiFetch } from "../../composables/useApiFetch";

config({
  editorConfig: {
    languageUserDefined: {
      "zh-CN": {
        toolbarTips: {
          bold: "加粗",
          underline: "下划线",
          italic: "斜体",
          strikeThrough: "删除线",
          title: "标题",
          sub: "下标",
          sup: "上标",
          quote: "引用",
          unorderedList: "无序列表",
          orderedList: "有序列表",
          task: "任务列表",
          codeRow: "行内代码",
          code: "块级代码",
          link: "链接",
          image: "图片",
          table: "表格",
          mermaid: "Mermaid图",
          katex: "公式",
          revoke: "后退",
          next: "前进",
          save: "保存",
          prettier: "美化",
          pageFullscreen: "浏览器全屏",
          fullscreen: "屏幕全屏",
          preview: "预览",
          htmlPreview: "html代码预览",
          catalog: "目录",
          github: "源码地址",
        },
      },
    },
  },
});

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  coverImage: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  key: string;
}

interface Tag {
  id: number;
  title: string;
  key: string;
}

interface ArticleForm {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  coverImage: string;
  order: number;
}

const userStore = useUserStore();
const $api = useApiFetch();
const loading = ref(false);
const tagModalVisible = ref(false);
const tagModalLoading = ref(false);
const saving = ref(false);
const uploadLoading = ref(false);
const previewVisible = ref(false);
const articles = ref<Article[]>([]);
const categoryOptions = ref<{ label: string; value: string }[]>([]);
const tagOptions = ref<{ label: string; value: string }[]>([]);
const categoriesLoading = ref(false);
const tagsLoading = ref(false);

const mdToolbars = [
  "bold",
  "underline",
  "italic",
  "strikeThrough",
  "title",
  "sub",
  "sup",
  "quote",
  "unorderedList",
  "orderedList",
  "task",
  "-",
  "codeRow",
  "code",
  "link",
  "image",
  "table",
  "mermaid",
  "katex",
  "-",
  "revoke",
  "next",
  "save",
  "prettier",
  "pageFullscreen",
  "fullscreen",
  "preview",
  "htmlPreview",
  "catalog",
] as const;

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { title: "ID", dataIndex: "id", key: "id", width: 60 },
  { title: "封面", dataIndex: "coverImage", key: "coverImage", width: 150 },
  { title: "标题", dataIndex: "title", key: "title" },
  { title: "分类", dataIndex: "category", key: "category", width: 120 },
  { title: "标签", dataIndex: "tags", key: "tags", width: 160 },
  { title: "排序", dataIndex: "order", key: "order", width: 80 },
  { title: "状态", dataIndex: "isPublished", key: "isPublished", width: 100 },
  {
    title: "操作",
    key: "actions",
    width: 160,
  },
];

const emptyForm = (): ArticleForm => ({
  title: "",
  content: "",
  category: "",
  tags: [],
  isPublished: true,
  coverImage: "",
  order: 0,
});

const form = reactive<ArticleForm>(emptyForm());
const modalOpen = ref(false);
const editing = ref(false);
const editingId = ref<number | null>(null);
const tagFormRef = ref<FormInstance>();

const { isMobile } = useMobile();

const tagForm = reactive({
  title: "",
  key: "",
  order: 0,
  isVisible: true,
});

const tagRules = {
  title: [{ required: true, message: "请输入标签名称" }],
  key: [{ required: true, message: "请输入标签标识" }],
};

const fetchCategories = async () => {
  try {
    categoriesLoading.value = true;
    const res = await $api<{ statusCode: number; data?: Category[]; error?: string }>("/api/categories");
    if (res.statusCode === 200 && res.data) {
      categoryOptions.value = res.data.map((item: Category) => ({
        label: item.name,
        value: item.key,
      }));
    }
  } catch {
    message.error("获取分类列表失败");
  } finally {
    categoriesLoading.value = false;
  }
};

const fetchTags = async () => {
  try {
    tagsLoading.value = true;
    const res = await $api<{ statusCode: number; data?: { data: Tag[]; pagination: any }; error?: string }>("/api/tags", {
      query: { page: 1, pageSize: 100 },
    });
    if (res.statusCode === 200 && res.data) {
      tagOptions.value = (res.data.data || []).map((item: Tag) => ({
        label: item.title,
        value: item.key,
      }));
    }
  } catch {
    message.error("获取标签列表失败");
  } finally {
    tagsLoading.value = false;
  }
};

const fetchArticles = async () => {
  try {
    loading.value = true;
    const res = await $api<{
      statusCode: number;
      data?: {
        data: Article[];
        pagination: { current: number; pageSize: number; total: number; totalPages: number };
      };
      error?: string;
    }>("/api/articles/list", {
      query: {
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    });

    if (res.statusCode === 200 && res.data) {
      articles.value = res.data.data;
      pagination.current = res.data.pagination.current;
      pagination.pageSize = res.data.pagination.pageSize;
      pagination.total = res.data.pagination.total;
    } else {
      message.error(res.error || "获取文章列表失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || "获取文章列表失败");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pager: any) => {
  pagination.current = pager.current;
  pagination.pageSize = pager.pageSize;
  fetchArticles();
};

const resetForm = () => {
  Object.assign(form, emptyForm());
};

const openCreate = async () => {
  editing.value = false;
  editingId.value = null;
  resetForm();
  await Promise.all([fetchCategories(), fetchTags()]);
  modalOpen.value = true;
};

const openEdit = async (record: Article) => {
  editing.value = true;
  editingId.value = record.id;
  Object.assign(form, {
    title: record.title,
    content: record.content,
    category: record.category,
    tags: record.tags ?? [],
    isPublished: record.isPublished,
    coverImage: record.coverImage,
    order: record.order,
  });
  await Promise.all([fetchCategories(), fetchTags()]);
  modalOpen.value = true;
};

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("只能上传图片文件");
    return false;
  }
  const isLt20M = file.size / 1024 / 1024 < 20;
  if (!isLt20M) {
    message.error("图片必须小于20MB");
    return false;
  }
  return true;
};

const customUpload = async (options: any) => {
  try {
    uploadLoading.value = true;
    const file = options.file as File;
    const formData = new FormData();
    formData.append("file", file);

    const authHeaders: Record<string, string> = {};
    if (userStore.token) {
      authHeaders.Authorization = `Bearer ${userStore.token}`;
    }

    const res = await fetch("/api/upload/image", {
      method: "POST",
      body: formData,
      headers: authHeaders,
    });

    const data = await res.json();

    if (data.statusCode === 200 && data.data?.url) {
      form.coverImage = data.data.url;
      message.success("上传成功");
      options.onSuccess();
    } else {
      throw new Error(data.error || data.message || "上传失败");
    }
  } catch (error: any) {
    message.error(error.message || "上传失败");
    options.onError(error);
  } finally {
    uploadLoading.value = false;
  }
};

const removeCover = () => {
  form.coverImage = "";
};

const openTagModal = () => {
  tagForm.title = "";
  tagForm.key = "";
  tagForm.order = 0;
  tagForm.isVisible = true;
  tagModalVisible.value = true;
};

const handleTagChange = (value: string[]) => {
  const last = value[value.length - 1];
  if (!last) return;

  const exists = tagOptions.value.some((opt) => opt.value === last);
  if (!exists) {
    tagForm.title = last;
    tagForm.key = last.toLowerCase().replace(/\s+/g, "-");
    tagModalVisible.value = true;
  }
};

const handleTagModalOk = async () => {
  try {
    await tagFormRef.value?.validate();
    tagModalLoading.value = true;

    const res = await $api<{ statusCode: number; data?: Tag; error?: string }>("/api/tags", {
      method: "POST",
      body: {
        title: tagForm.title,
        key: tagForm.key,
        order: tagForm.order,
        isVisible: tagForm.isVisible,
      },
    });

    if (res.statusCode === 200 && res.data) {
      message.success("创建标签成功");
      await fetchTags();
      if (!form.tags.includes(res.data.key)) {
        form.tags = [...form.tags, res.data.key];
      }
      tagModalVisible.value = false;
    } else {
      message.error(res.error || "创建标签失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || error?.message || "创建标签失败");
  } finally {
    tagModalLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.title || !form.category || !form.content) {
    message.warning("标题、分类、内容为必填项");
    return;
  }

  const payload = { ...form };

  try {
    saving.value = true;
    if (editing.value && editingId.value != null) {
      const res = await $api<{
        statusCode: number;
        data?: Article;
        error?: string;
      }>(`/api/articles/${editingId.value}`, {
        method: "PUT",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("更新成功");
        modalOpen.value = false;
        fetchArticles();
      } else {
        message.error(res.error || "更新失败");
      }
    } else {
      const res = await $api<{
        statusCode: number;
        data?: Article;
        error?: string;
      }>("/api/articles", {
        method: "POST",
        body: payload,
      });
      if (res.statusCode === 200 && res.data) {
        message.success("创建成功");
        modalOpen.value = false;
        fetchArticles();
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
    }>(`/api/articles/${id}`, {
      method: "DELETE",
    });
    if (res.statusCode === 200 && res.message && !res.error) {
      message.success(res.message);
      fetchArticles();
    } else {
      message.error(res.error || res.message || "删除失败");
    }
  } catch (error: any) {
    message.error(error?.data?.error || error?.data?.message || "删除失败");
  }
};

onMounted(() => {
  fetchArticles();
  fetchCategories();
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

  /* 表格横向滚动 */
  :deep(.ant-table-wrapper) {
    overflow-x: auto;
  }

  :deep(.ant-table) {
    min-width: 800px;
  }

  /* 表格列优化 */
  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px;
    font-size: 12px;
  }

  /* 操作按钮优化 */
  :deep(.ant-space) {
    flex-wrap: wrap;
  }

  /* 封面图优化 */
  :deep(.ant-image) {
    width: 60px !important;
    height: 45px;
    object-fit: cover;
  }
}

/* 平板优化 */
@media (min-width: 769px) and (max-width: 991px) {
  .page-header h2 {
    font-size: 20px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 10px 8px;
    font-size: 13px;
  }
}

.cover-upload {
  width: 150px;
  height: 100px;
}

.cover-preview {
  position: relative;
  width: 150px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-preview:hover .cover-actions {
  opacity: 1;
}

.delete-icon {
  color: #fff;
  font-size: 18px;
}

:deep(.ant-upload.ant-upload-select-picture-card) {
  width: 150px;
  height: 100px;
  margin: 0;
}
</style>
