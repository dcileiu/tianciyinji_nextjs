"use client";

import dynamic from "next/dynamic";
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import "md-editor-rt/lib/style.css";

const MdEditor = dynamic(
  () => import("md-editor-rt").then((m) => m.MdEditor),
  { ssr: false },
);

function MdFormField({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <MdEditor
      modelValue={value ?? ""}
      onChange={onChange}
      language="zh-CN"
      preview
      style={{ height: 400 }}
    />
  );
}

interface Article {
  id: number;
  title: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  coverImage?: string;
  order?: number;
  content?: string;
  updatedAt?: string;
}

interface CategoryOpt {
  id: number;
  name: string;
  key: string;
}

interface TagOpt {
  id: number;
  title: string;
  key: string;
}

export default function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOpt[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<{
    title: string;
    category: string;
    tags: string[];
    order: number;
    isPublished: boolean;
    coverImage: string;
    content: string;
  }>();

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await adminFetch<{
        statusCode: number;
        data?: { data: Article[]; pagination: { total: number } };
      }>(`/api/articles?page=${p}&pageSize=${pageSize}`);
      if (res.data) {
        setArticles(res.data.data ?? []);
        setTotal(res.data.pagination?.total ?? 0);
      }
    } catch {
      /* handled */
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMeta = useCallback(async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        adminFetch<{ statusCode: number; data?: CategoryOpt[] }>(
          "/api/categories",
        ),
        adminFetch<{ statusCode: number; data?: { data: TagOpt[] } }>(
          "/api/tags?page=1&pageSize=200",
        ),
      ]);
      if (catRes.data && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
      if (tagRes.data?.data) setTagOptions(tagRes.data.data);
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      title: "",
      category: undefined,
      tags: [],
      order: 0,
      isPublished: true,
      coverImage:
        "http://p1.qhimg.com/t01b4d0943444706854.jpg",
      content: "",
    });
    setModalOpen(true);
  };

  const openEdit = async (record: Article) => {
    setEditingId(record.id);
    const res = await adminFetch<{ statusCode: number; data?: Article }>(
      `/api/articles/${record.id}`,
    );
    const a = res.data;
    if (!a) {
      message.error("加载文章失败");
      return;
    }
    form.setFieldsValue({
      title: a.title,
      category: a.category,
      tags: Array.isArray(a.tags) ? a.tags : [],
      order: a.order ?? 0,
      isPublished: !!a.isPublished,
      coverImage: a.coverImage,
      content: a.content ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await adminFetch(`/api/articles/${id}`, { method: "DELETE" });
      message.success("已删除");
      load(page);
    } catch {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const v = await form.validateFields();
      setSaving(true);
      const body = {
        title: v.title,
        category: v.category,
        tags: v.tags ?? [],
        order: v.order ?? 0,
        isPublished: v.isPublished,
        coverImage: v.coverImage,
        content: v.content ?? "",
      };
      if (editingId) {
        await adminFetch(`/api/articles/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        message.success("已保存");
      } else {
        await adminFetch("/api/articles", {
          method: "POST",
          body: JSON.stringify(body),
        });
        message.success("已创建");
      }
      setModalOpen(false);
      load(page);
    } catch (e) {
      if (e instanceof Error && e.message !== "Unauthorized") {
        message.error("保存失败");
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file: File) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/image", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const json = (await res.json()) as {
      statusCode?: number;
      data?: { url?: string };
      error?: string;
    };
    if (json.data?.url) {
      form.setFieldValue("coverImage", json.data.url);
      message.success("上传成功");
    } else {
      message.error(json.error || "上传失败");
    }
  };

  const columns: ColumnsType<Article> = [
    { title: "ID", dataIndex: "id", width: 70 },
    {
      title: "封面",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 140,
      render: (url: string) =>
        url ? <Image src={url} width={100} alt="" /> : null,
    },
    { title: "标题", dataIndex: "title" },
    { title: "分类", dataIndex: "category", width: 100 },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      render: (t: string[]) =>
        (t ?? []).map((x) => <Tag key={x}>{x}</Tag>),
    },
    {
      title: "状态",
      dataIndex: "isPublished",
      width: 100,
      render: (p: boolean) => (p ? "已发布" : "草稿"),
    },
    {
      title: "操作",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categorySelectOptions = categories.map((c) => ({
    label: c.name,
    value: c.key,
  }));

  const tagSelectOptions = tagOptions.map((t) => ({
    label: t.title,
    value: t.key,
  }));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>文章管理</h2>
        <Button type="primary" onClick={openCreate}>
          新建文章
        </Button>
      </div>
      <Table<Article>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={articles}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p) => setPage(p),
        }}
      />
      <Modal
        title={editingId ? "编辑文章" : "新建文章"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        width="min(1200px, 96vw)"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入标题" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: "请选择分类" }]}
          >
            <Select options={categorySelectOptions} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" options={tagSelectOptions} />
          </Form.Item>
          <Form.Item name="order" label="排序">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isPublished" label="发布" valuePropName="checked">
            <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
          </Form.Item>
          <Form.Item name="coverImage" label="封面 URL">
            <Input addonAfter={
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  uploadCover(file);
                  return false;
                }}
              >
                <Button size="small" icon={<PlusOutlined />}>
                  上传
                </Button>
              </Upload>
            } />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <MdFormField />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
