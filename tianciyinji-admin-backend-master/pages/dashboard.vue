<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2 class="dashboard-title">仪表盘</h2>
      <p class="dashboard-subtitle">欢迎回来，这里是您的数据概览</p>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable class="stat-card stat-card-blue">
          <a-statistic title="文章数量" :value="statistics.articles" :loading="loading" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable class="stat-card stat-card-green">
          <a-statistic title="标签数量" :value="tagList.length" :loading="loading" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable class="stat-card stat-card-orange">
          <a-statistic title="访问数量" :value="statistics.visits" :loading="loading" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card hoverable class="stat-card stat-card-pink">
          <a-statistic title="阅读数量" :value="statistics.reads" :loading="loading" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <a-col :xs="24" :md="16">
        <a-card title="最新文章" :loading="loading">
          <a-list :data-source="latestArticles" :pagination="false">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-image :src="item.coverImage" :width="120" :preview="false" />
                  </template>
                  <template #title>
                    <span class="article-title">{{ item.title }}</span>
                  </template>
                  <template #description>
                    <a-space size="middle" wrap>
                      <a-tag size="small">{{ item.category }}</a-tag>
                      <span class="article-meta">阅读 {{ item.views || 0 }}</span>
                      <span class="article-meta">{{ formatDate(item.updatedAt) }}</span>
                    </a-space>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="8">
        <a-card title="标签云" :loading="loading" class="tags-card">
          <TagCloud :data="tagList" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <a-col :span="24">
        <a-card title="访问趋势" :loading="loading">
          <div class="trend-wrap">
            <VisitTrendChart :data="dailyVisits" />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore Nuxt auto-import
definePageMeta({ ssr: false });

import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import { useApiFetch } from "../composables/useApiFetch";
import TagCloud from "../components/TagCloud.vue";
import VisitTrendChart from "../components/VisitTrendChart.client.vue";

// @ts-ignore Nuxt auto-import
useHead({
  title: "仪表盘 - 天赐印记后台",
});

interface DashboardStatistics {
  articles: number;
  visits: number;
  reads: number;
}

interface TagItem {
  id: number;
  title: string;
  key?: string;
  order?: number;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Article {
  id: number;
  title: string;
  category: string;
  coverImage: string;
  views?: number;
  updatedAt: string;
}

interface DailyVisit {
  date: string;
  siteVisits: number;
  articleViews: number;
}

const $api = useApiFetch();
const loading = ref(false);

const statistics = ref<DashboardStatistics>({
  articles: 0,
  visits: 0,
  reads: 0,
});

const tagList = ref<TagItem[]>([]);
const latestArticles = ref<Article[]>([]);
const dailyVisits = ref<DailyVisit[]>([
  { date: "03-14", siteVisits: 125, articleViews: 89 },
  { date: "03-15", siteVisits: 243, articleViews: 156 },
  { date: "03-16", siteVisits: 187, articleViews: 134 },
  { date: "03-17", siteVisits: 299, articleViews: 205 },
  { date: "03-18", siteVisits: 356, articleViews: 287 },
  { date: "03-19", siteVisits: 278, articleViews: 198 },
  { date: "03-20", siteVisits: 334, articleViews: 245 },
]);

const formatDate = (value: string) => dayjs(value).format("YYYY-MM-DD");

const fetchData = async () => {
  try {
    loading.value = true;

    const [statsRes, tagsRes, articlesRes] = await Promise.all([
      $api<{ statusCode: number; data?: { totalViews: number; totalArticles: number; totalArticleViews: number } }>(
        "/api/statistics",
      ),
      $api<{ statusCode: number; data?: { data: TagItem[]; pagination: any } }>("/api/tags", {
        query: { page: 1, pageSize: 100 },
      }),
      $api<{ statusCode: number; data?: { data: Article[] } }>("/api/articles/list", {
        query: { page: 1, pageSize: 5 },
      }),
    ]);

    if (statsRes.data) {
      statistics.value.visits = statsRes.data.totalViews ?? 0;
      statistics.value.reads = statsRes.data.totalArticleViews ?? 0;
      statistics.value.articles = statsRes.data.totalArticles ?? 0;
    }

    if (tagsRes.data) {
      tagList.value = tagsRes.data.data || [];
    }

    if (articlesRes.data) {
      latestArticles.value = articlesRes.data.data ?? [];
    }
  } catch (error) {
    console.error("获取仪表盘数据失败:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.dashboard {
  padding: 0;
  background: #f5f5f5;
  min-height: 100%;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.dashboard-subtitle {
  color: rgba(0, 0, 0, 0.45);
}

.stat-card {
  border-radius: 12px;
}

.stat-card-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card-orange {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.stat-card-pink {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.tags-card {
  min-height: 420px;
}

.trend-wrap {
  width: 100%;
}

:deep(.stat-card .ant-statistic-title),
:deep(.stat-card .ant-statistic-content) {
  color: #fff;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .dashboard {
    padding: 0;
  }

  .dashboard-header {
    margin-bottom: 16px;
  }

  .dashboard-title {
    font-size: 20px;
  }

  .dashboard-subtitle {
    font-size: 14px;
  }

  .tags-card {
    min-height: 300px;
  }

  /* 文章列表移动端优化 */
  :deep(.ant-list-item-meta-avatar) {
    margin-right: 12px;
  }

  :deep(.ant-list-item-meta-title) {
    font-size: 14px;
    margin-bottom: 4px;
  }

  :deep(.ant-list-item-meta-description) {
    font-size: 12px;
  }

  :deep(.ant-image) {
    width: 80px !important;
    height: 60px;
    object-fit: cover;
  }

  :deep(.ant-space) {
    flex-wrap: wrap;
  }
}

/* 平板优化 */
@media (min-width: 769px) and (max-width: 991px) {
  .dashboard-title {
    font-size: 22px;
  }

  .tags-card {
    min-height: 360px;
  }
}
</style>
