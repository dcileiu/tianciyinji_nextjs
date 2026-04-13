<template>
  <div ref="chartContainer" class="visit-trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as echarts from "echarts";

interface DailyVisit {
  date: string;
  siteVisits: number;
  articleViews: number;
}

const props = defineProps<{
  data: DailyVisit[];
}>();

const chartContainer = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const initChart = async () => {
  if (!chartContainer.value) return;

  await nextTick();

  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value);
  }

  const dates = props.data.map((item) => item.date);
  const siteVisits = props.data.map((item) => item.siteVisits);
  const articleViews = props.data.map((item) => item.articleViews);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: ["网站活跃量", "文章访问量"],
      bottom: 0,
    },
    grid: {
      left: isMobile ? "8%" : "3%",
      right: isMobile ? "4%" : "4%",
      bottom: isMobile ? "20%" : "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "网站活跃量",
        type: "line",
        smooth: true,
        data: siteVisits,
        itemStyle: {
          color: "#1677ff",
        },
        lineStyle: {
          color: "#1677ff",
        },
      },
      {
        name: "文章访问量",
        type: "line",
        smooth: true,
        data: articleViews,
        itemStyle: {
          color: "#52c41a",
        },
        lineStyle: {
          color: "#52c41a",
        },
      },
    ],
  };

  chartInstance.setOption(option);

  // 响应式调整
  window.addEventListener("resize", handleResize);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

watch(
  () => props.data,
  () => {
    if (chartInstance && props.data.length > 0) {
      initChart();
    }
  },
  { deep: true }
);

onMounted(() => {
  if (props.data.length > 0) {
    initChart();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.visit-trend-chart {
  width: 100%;
  height: 400px;
  min-height: 300px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .visit-trend-chart {
    height: 300px;
    min-height: 250px;
  }
}

/* 平板优化 */
@media (min-width: 769px) and (max-width: 991px) {
  .visit-trend-chart {
    height: 350px;
  }
}
</style>
