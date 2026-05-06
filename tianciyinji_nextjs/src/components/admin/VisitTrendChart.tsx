"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export interface DailyVisitPoint {
  date: string;
  siteVisits: number;
  articleViews: number;
}

export default function VisitTrendChart({ data }: { data: DailyVisitPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["站点访问", "文章阅读"] },
      xAxis: { type: "category", data: data.map((d) => d.date) },
      yAxis: { type: "value" },
      series: [
        {
          name: "站点访问",
          type: "line",
          data: data.map((d) => d.siteVisits),
          smooth: true,
        },
        {
          name: "文章阅读",
          type: "line",
          data: data.map((d) => d.articleViews),
          smooth: true,
        },
      ],
    });
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [data]);

  return <div ref={ref} style={{ width: "100%", height: 360 }} />;
}
