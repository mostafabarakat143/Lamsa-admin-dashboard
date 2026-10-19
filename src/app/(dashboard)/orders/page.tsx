import type { Metadata } from "next";

import { OrdersClient } from "@/components/orders/orders-client";
import { fetchPaginated } from "@/lib/api/client";
import { parseOrder } from "@/lib/api/parsers";
import { readInt, readString, toSearchParams } from "@/lib/api/query";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Orders",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdersPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const page = readInt(params, "page", 1) ?? 1;
  const pageSize = readInt(params, "pageSize", 20) ?? 20;
  const status = readString(params, "status") ?? "ALL";
  const userIdRaw = readString(params, "userId");
  const sortOrder = readString(params, "sortOrder") ?? "desc";

  const userId = userIdRaw ? Number(userIdRaw) : undefined;
  const userIdFilter =
    userId !== undefined && Number.isInteger(userId) && userId > 0
      ? String(userId)
      : undefined;

  const query: Record<string, string | undefined> = {
    page: String(page),
    pageSize: String(pageSize),
    status,
    userId: userIdFilter,
    sortOrder,
  };

  const listPath = `/api/v1/orders${toSearchParams({
    page,
    pageSize,
    status,
    userId: userIdFilter ? Number(userIdFilter) : undefined,
    sortOrder,
  })}`;

  const result = await fetchPaginated(admin.token, listPath, parseOrder);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Orders</h1>
      </div>

      <OrdersClient
        orders={result.ok ? result.data.items : []}
        meta={result.ok ? result.data.meta : null}
        error={result.ok ? null : result.error.message}
        query={query}
      />
    </div>
  );
}
