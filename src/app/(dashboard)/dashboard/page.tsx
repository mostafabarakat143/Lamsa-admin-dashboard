import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Layers,
  Package,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";

import { DashboardDonutChart } from "@/components/dashboard/dashboard-donut-chart";
import { DashboardLineChart } from "@/components/dashboard/dashboard-line-chart";
import { DashboardRangeFilters } from "@/components/dashboard/dashboard-range-filters";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LoadingState } from "@/components/ui/loading-state";
import { loadAdminDashboard } from "@/lib/api/dashboard";
import { readString } from "@/lib/api/query";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const from = readString(params, "from");
  const to = readString(params, "to");
  const bucketRaw = readString(params, "bucket");
  const bucket = bucketRaw === "day" ? "day" : "month";

  const result = await loadAdminDashboard(admin.token, { from, to, bucket });
  const dashboard = result.ok ? result.data : null;
  const error = result.ok ? null : result.error.message;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Product, user, category, and subcategory totals are all-time. Order
          total, status breakdown, and the chart follow the selected range.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep"
        >
          {error}
        </p>
      ) : null}

      <section
        aria-label="Summary statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatsCard
          title="Total Products"
          icon={Package}
          state={dashboard ? "ready" : error ? "error" : "loading"}
          value={dashboard?.totals.products}
          errorMessage={error ?? undefined}
        />
        <StatsCard
          title="Total Users"
          icon={Users}
          state={dashboard ? "ready" : error ? "error" : "loading"}
          value={dashboard?.totals.users}
          errorMessage={error ?? undefined}
        />
        <StatsCard
          title="Total Categories"
          icon={Tags}
          state={dashboard ? "ready" : error ? "error" : "loading"}
          value={dashboard?.totals.categories}
          errorMessage={error ?? undefined}
        />
        <StatsCard
          title="Total Subcategories"
          icon={Layers}
          state={dashboard ? "ready" : error ? "error" : "loading"}
          value={dashboard?.totals.subcategories}
          errorMessage={error ?? undefined}
        />
        <StatsCard
          title="Total Orders"
          icon={ShoppingBag}
          state={dashboard ? "ready" : error ? "error" : "loading"}
          value={dashboard?.totals.orders}
          errorMessage={error ?? undefined}
        />
      </section>

      <Suspense fallback={<LoadingState label="Loading range filters" compact />}>
        <DashboardRangeFilters from={from} to={to} bucket={bucket} />
      </Suspense>

      <section
        aria-label="Order analytics"
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        <DashboardLineChart
          description="UTC period labels from the admin dashboard aggregate."
          error={Boolean(error)}
          data={
            dashboard?.ordersOverTime.map((point) => ({
              label: point.period,
              value: point.count,
            })) ?? []
          }
        />
        <DashboardDonutChart
          description="Order status counts for the selected range."
          error={Boolean(error)}
          data={
            dashboard
              ? [
                  {
                    status: "PENDING",
                    count: dashboard.ordersByStatus.PENDING,
                  },
                  {
                    status: "CONFIRMED",
                    count: dashboard.ordersByStatus.CONFIRMED,
                  },
                  {
                    status: "FULFILLED",
                    count: dashboard.ordersByStatus.FULFILLED,
                  },
                  {
                    status: "CANCELLED",
                    count: dashboard.ordersByStatus.CANCELLED,
                  },
                ]
              : []
          }
        />
      </section>
    </div>
  );
}
