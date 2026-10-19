"use client";

import { ChartContainer } from "@/components/dashboard/chart-container";
import { cn } from "@/lib/utils/cn";
import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type OrderStatusSlice =
  | "PENDING"
  | "CONFIRMED"
  | "FULFILLED"
  | "CANCELLED";

export type DashboardDonutChartSlice = {
  status: OrderStatusSlice;
  count: number;
};

export type DashboardDonutChartProps = {
  title?: string;
  description?: string;
  data?: DashboardDonutChartSlice[];
  loading?: boolean;
  error?: boolean;
  unavailable?: boolean;
  className?: string;
};

const STATUS_COLORS: Record<OrderStatusSlice, string> = {
  PENDING: "#f4e3d6",
  CONFIRMED: "#c6a36a",
  FULFILLED: "#9c4e68",
  CANCELLED: "#74685f",
};

const STATUS_LABELS: Record<OrderStatusSlice, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

type ChartRow = {
  name: string;
  status: OrderStatusSlice;
  value: number;
  fill: string;
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartRow; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm">
      <p className="font-medium">{row.name}</p>
      <p className="text-muted">{row.value} orders</p>
    </div>
  );
}

export function DashboardDonutChart({
  title = "Orders by status",
  description,
  data = [],
  loading = false,
  error = false,
  unavailable = false,
  className,
}: DashboardDonutChartProps) {
  const chartData = useMemo(() => {
    return data
      .filter((row) => row.count > 0)
      .map((row) => ({
        name: STATUS_LABELS[row.status],
        status: row.status,
        value: row.count,
        fill: STATUS_COLORS[row.status],
      }));
  }, [data]);

  const total = useMemo(
    () => chartData.reduce((sum, row) => sum + row.value, 0),
    [chartData],
  );

  let state: "ready" | "loading" | "empty" | "unavailable" | "error" = "ready";
  if (loading) state = "loading";
  else if (error) state = "error";
  else if (unavailable) state = "unavailable";
  else if (chartData.length === 0) state = "empty";

  return (
    <ChartContainer
      title={title}
      description={description}
      state={state}
      emptyTitle="No orders to chart"
      emptyDescription="Status breakdown appears when orders exist."
      className={className}
    >
      <div className={cn("flex flex-col gap-6 md:flex-row md:items-center")}>
        <div className="relative mx-auto h-[240px] w-full max-w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={2}
                stroke="#fff9f3"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-wide text-muted">Total</p>
            <p className="text-2xl font-semibold text-ink">{total}</p>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-3" aria-label="Order status legend">
          {chartData.map((row) => {
            const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
            return (
              <li
                key={row.status}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2 text-ink">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: row.fill }}
                    aria-hidden
                  />
                  {row.name}
                </span>
                <span className="tabular-nums text-muted">
                  {row.value}{" "}
                  <span className="text-ink">({pct}%)</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </ChartContainer>
  );
}
