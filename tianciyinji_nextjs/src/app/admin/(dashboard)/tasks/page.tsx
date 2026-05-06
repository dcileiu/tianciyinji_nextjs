"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { adminFetch } from "@/lib/admin-fetch";

interface Row {
  id: number;
  name: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
}

export default function TasksPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await adminFetch<{
        statusCode: number;
        data?: { data: Row[]; pagination: { total: number } };
      }>(`/api/tasks?page=${p}`);
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

  const columns: ColumnsType<Row> = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "完成",
      dataIndex: "isCompleted",
      width: 80,
      render: (v: boolean) => (v ? "是" : "否"),
    },
    {
      title: "操作",
      key: "a",
      width: 200,
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await adminFetch(`/api/tasks/${r.id}`, {
                method: "PUT",
                body: JSON.stringify({ isCompleted: !r.isCompleted }),
              });
              message.success("已更新");
              load(page);
            }}
          >
            切换完成
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={async () => {
              await adminFetch(`/api/tasks/${r.id}`, { method: "DELETE" });
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
        <h2 style={{ margin: 0 }}>任务管理</h2>
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setOpen(true);
          }}
        >
          新建任务
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
        title="新建任务"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          await adminFetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify(v),
          });
          message.success("已创建");
          setOpen(false);
          load(page);
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期">
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
