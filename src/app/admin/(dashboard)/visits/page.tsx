"use client";

import { useCallback, useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { adminFetch } from "@/lib/admin-fetch";

interface Row {
  id: number;
  ip?: string;
  path?: string;
  referer?: string;
  userAgent?: string;
  createdAt: string;
}

export default function VisitsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<{
        statusCode: number;
        data?: { data: Row[]; pagination: { total: number } };
      }>(`/api/visits?page=${page}`);
      if (res.data) {
        setRows(res.data.data ?? []);
        setTotal(res.data.pagination?.total ?? 0);
      }
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<Row> = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "IP", dataIndex: "ip", width: 140 },
    { title: "路径", dataIndex: "path", ellipsis: true },
    { title: "来源", dataIndex: "referer", ellipsis: true },
    { title: "UA", dataIndex: "userAgent", ellipsis: true },
    { title: "时间", dataIndex: "createdAt", width: 180 },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>访问记录</h2>
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
