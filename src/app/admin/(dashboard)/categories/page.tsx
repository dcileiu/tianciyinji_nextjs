"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { adminFetch } from "@/lib/admin-fetch";

interface Row {
  id: number;
  name: string;
  key: string;
  order: number;
}

export default function CategoriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{ statusCode: number; data?: Row[] }>(
        "/api/categories",
      );
      if (Array.isArray(res.data)) setRows(res.data);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    const v = await form.validateFields();
    try {
      if (editing) {
        await adminFetch(`/api/categories/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(v),
        });
        message.success("已更新");
      } else {
        await adminFetch("/api/categories", {
          method: "POST",
          body: JSON.stringify(v),
        });
        message.success("已创建");
      }
      setOpen(false);
      load();
    } catch {
      message.error("保存失败");
    }
  };

  const columns: ColumnsType<Row> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "名称", dataIndex: "name" },
    { title: "Key", dataIndex: "key" },
    { title: "排序", dataIndex: "order", width: 80 },
    {
      title: "操作",
      key: "a",
      width: 160,
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditing(r);
              form.setFieldsValue(r);
              setOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={async () => {
            await adminFetch(`/api/categories/${r.id}`, { method: "DELETE" });
            message.success("已删除");
            load();
          }}>
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>分类管理</h2>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ order: 0 });
            setOpen(true);
          }}
        >
          新建
        </Button>
      </div>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} />
      <Modal
        title={editing ? "编辑分类" : "新建分类"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="key" label="Key" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="order" label="排序">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
