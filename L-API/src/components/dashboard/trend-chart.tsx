"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const config = {
  requests: { label: "请求数", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function TrendChart({
  data,
  className,
}: {
  data: { date: string; requests: number }[];
  className?: string;
}) {
  return (
    <ChartContainer config={config} className={className ?? "h-64 w-full"}>
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-requests)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-requests)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="requests"
          type="monotone"
          stroke="var(--color-requests)"
          fill="url(#fillRequests)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
