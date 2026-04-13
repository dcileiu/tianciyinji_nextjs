"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, Col, List, Row, Statistic, Tag } from "antd";
import dayjs from "dayjs";
import { adminFetch } from "@/lib/admin-fetch";
import VisitTrendChart from "@/components/admin/VisitTrendChart";

interface TagItem {
  id: number;
  title: string;
  key?: string;
}

interface ArticleRow {
  id: number;
  title: string;
  category: string;
  coverImage: string;
  views?: number;
  updatedAt: string;
}

const sampleTrend = [
  { date: "03-14", siteVisits: 125, articleViews: 89 },
  { date: "03-15", siteVisits: 243, articleViews: 156 },
  { date: "03-16", siteVisits: 187, articleViews: 134 },
  { date: "03-17", siteVisits: 299, articleViews: 205 },
  { date: "03-18", siteVisits: 356, articleViews: 287 },
  { date: "03-19", siteVisits: 278, articleViews: 198 },
  { date: "03-20", siteVisits: 334, articleViews: 245 },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    articles: 0,
    visits: 0,
    reads: 0,
  });
  const [tags, setTags] = useState<TagItem[]>([]);
  const [latest, setLatest] = useState<ArticleRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, tagsRes, articlesRes] = await Promise.all([
          adminFetch<{
            statusCode: number;
            data?: {
              totalViews: number;
              totalArticles: number;
              totalArticleViews: number;
            };
          }>("/api/statistics"),
          adminFetch<{
            statusCode: number;
            data?: { data: TagItem[] };
          }>("/api/tags?page=1&pageSize=100"),
          adminFetch<{
            statusCode: number;
            data?: { data: ArticleRow[] };
          }>("/api/articles/list?page=1&pageSize=5"),
        ]);
        if (cancelled) return;
        if (statsRes.data) {
          setStats({
            visits: statsRes.data.totalViews ?? 0,
            reads: statsRes.data.totalArticleViews ?? 0,
            articles: statsRes.data.totalArticles ?? 0,
          });
        }
        if (tagsRes.data?.data) setTags(tagsRes.data.data);
        if (articlesRes.data?.data) setLatest(articlesRes.data.data);
      } catch {
        /* 401 已由 adminFetch 处理 */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>仪表盘</h2>
        <p style={{ color: "rgba(0,0,0,0.45)" }}>欢迎回来，这里是您的数据概览</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="文章数量" value={stats.articles} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="标签数量" value={tags.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="访问数量" value={stats.visits} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="阅读数量" value={stats.reads} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <Card title="最新文章" loading={loading}>
            <List
              dataSource={latest}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Image
                        src={item.coverImage}
                        alt=""
                        width={120}
                        height={68}
                        unoptimized
                        style={{ objectFit: "cover", borderRadius: 4 }}
                      />
                    }
                    title={item.title}
                    description={
                      <span>
                        <Tag>{item.category}</Tag> 阅读 {item.views ?? 0}{" "}
                        {dayjs(item.updatedAt).format("YYYY-MM-DD")}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="标签云" loading={loading} style={{ minHeight: 420 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tags.map((t) => (
                <Tag key={t.id}>{t.title}</Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="访问趋势" loading={loading}>
            <VisitTrendChart data={sampleTrend} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
