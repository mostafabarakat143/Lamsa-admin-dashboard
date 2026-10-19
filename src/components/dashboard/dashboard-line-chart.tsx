"use client";

import { ChartContainer } from "@/components/dashboard/chart-container";
import { cn } from "@/lib/utils/cn";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardLineChartPoint = {
  label: string;
  value: number;
};

export type DashboardLineChartProps = {
  title?: string;
  description?: string;
  data?: DashboardLineChartPoint[];
  unavailable?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
};

const UNAVAILABLE_MESSAGE =
  "Orders over time requires a backend aggregate endpoint.";

export function DashboardLineChart({
  title = "Orders over time",
  description,
  data = [],
  unavailable = false,
  loading = false,
  error = false,
  className,
}: DashboardLineChartProps) {
  const isEmpty = data.length === 0;

  let state: "ready" | "loading" | "empty" | "unavailable" | "error" = "ready";
  if (loading) state = "loading";
  else if (error) state = "error";
  else if (unavailable) state = "unavailable";
  else if (isEmpty) state = "empty";

  return (
    <ChartContainer
      title={title}
      description={description}
      state={state}
      emptyTitle="No orders in range"
      emptyDescription="Try a wider date range or clear the filters."
      unavailableMessage={UNAVAILABLE_MESSAGE}
      className={className}
    >
      <div className={cn("h-[260px] w-full")}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e7d9c8" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#74685f", fontSize: 12 }}
              axisLine={{ stroke: "#e7d9c8" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#74685f", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff9f3",
                border: "1px solid #e7d9c8",
                borderRadius: "8px",
                color: "#3e342e",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#9c4e68"
              strokeWidth={2}
              dot={{ fill: "#9c4e68", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
