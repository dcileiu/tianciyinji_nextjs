"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { adminFetch } from "@/lib/admin-fetch";

interface Row {
  id: number;
  title: string;
  imageUrl: string;
  position: string;
  order: number;
  isVisible: boolean;
}

export default function AdvertisementsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await adminFetch<{
        statusCode: number;
        data?: { data: Row[]; pagination: { total: number } };
      }>(`/api/advertisements?page=${p}`);
      if (res.data) {
        setRows(res.data.data ?? []);
        setTotal(res.data.pagination?.total ?? 0);
      }
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const submit = async () => {
    const v = await form.validateFields();
    try {
      if (editing) {
        await adminFetch(`/api/advertisements/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(v),
        });
        message.success("已更新");
      } else {
        await adminFetch("/api/advertisements", {
          method: "POST",
          body: JSON.stringify({
            ...v,
            isVisible: v.isVisible ?? true,
          }),
        });
        message.success("已创建");
      }
      setOpen(false);
      load(page);
    } catch {
      message.error("保存失败");
    }
  };

  const columns: ColumnsType<Row> = [
    { title: "ID", dataIndex: "id", width: 60 },
    {
      title: "图",
      dataIndex: "imageUrl",
      width: 100,
      render: (u: string) => (
        <Image src={u} width={80} alt="" />
      ),
    },
    { title: "标题", dataIndex: "title" },
    { title: "位置", dataIndex: "position", width: 100 },
    { title: "排序", dataIndex: "order", width: 70 },
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
          <Popconfirm
            title="确定删除？"
            onConfirm={async () => {
              await adminFetch(`/api/advertisements/${r.id}`, {
                method: "DELETE",
              });
              message.success("已删除");
              load(page);
            }}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>广告管理</h2>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({
              order: 0,
              isVisible: true,
              position: "top",
            });
            setOpen(true);
          }}
        >
          新建
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: setPage,
        }}
      />
      <Modal
        title={editing ? "编辑广告" : "新建广告"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="图片 URL"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="position"
            label="位置"
            rules={[{ required: true }]}
          >
            <Input placeholder="如 top / sidebar" />
          </Form.Item>
          <Form.Item name="order" label="排序">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isVisible" label="可见" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
