"use client";

import { useCallback, useEffect, useState } from "react";
import { Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { adminFetch } from "@/lib/admin-fetch";

interface Row {
  id: number;
  level: string;
  message: string;
  userId?: number;
  ip?: string;
  createdAt: string;
}

export default function LogsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState<string | undefined>();
  const pageSize = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (level) q.set("level", level);
      const res = await adminFetch<{
        statusCode: number;
        data?: { data: Row[]; pagination: { total: number } };
      }>(`/api/logs?${q.toString()}`);
      if (res.data) {
        setRows(res.data.data ?? []);
        setTotal(res.data.pagination?.total ?? 0);
      }
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [page, level]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<Row> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "级别", dataIndex: "level", width: 90 },
    { title: "消息", dataIndex: "message", ellipsis: true },
    { title: "用户", dataIndex: "userId", width: 80 },
    { title: "IP", dataIndex: "ip", width: 120 },
    { title: "时间", dataIndex: "createdAt", width: 180 },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>日志管理</h2>
        <Select
          allowClear
          placeholder="筛选级别"
          style={{ width: 160 }}
          value={level}
          onChange={(v) => {
            setPage(1);
            setLevel(v);
          }}
          options={[
            { value: "info", label: "info" },
            { value: "warn", label: "warn" },
            { value: "error", label: "error" },
            { value: "debug", label: "debug" },
          ]}
        />
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
    </div>
  );
}
