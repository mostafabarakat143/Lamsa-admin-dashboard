"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Ban, CheckCircle, Eye, Truck } from "lucide-react";

import { TableToolbar } from "@/components/filters/table-toolbar";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { ManagementDialog } from "@/components/modals/management-dialog";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { buildPageHref as buildHref } from "@/lib/api/query";
import { parseOrder } from "@/lib/api/parsers";
import { getJson, patchJson, postJson } from "@/lib/client/fetch-json";
import { formatEgp } from "@/lib/utils/money";
import type { Order, PageMeta } from "@/types/api";

export type OrdersClientProps = {
  orders: Order[];
  meta: PageMeta | null;
  error: string | null;
  query: Record<string, string | undefined>;
};

const PATH = "/orders";

export function OrdersClient({
  orders,
  meta,
  error,
  query,
}: OrdersClientProps) {
  const router = useRouter();
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const pageHref = (page: number) => buildHref(PATH, query, { page: String(page) });

  async function openOrderDetails(order: Order) {
    setViewOrder(order);
    setViewLoading(true);
    setViewError(null);
    const result = await getJson(`/api/orders/${order.id}`);
    setViewLoading(false);
    if (!result.ok) {
      setViewError(result.message);
      return;
    }
    const payload =
      typeof result.data === "object" &&
      result.data !== null &&
      "order" in result.data
        ? (result.data as { order: unknown }).order
        : result.data;
    const parsed = parseOrder(payload);
    if (!parsed) {
      setViewError("Unexpected order response.");
      return;
    }
    setViewOrder(parsed);
  }

  async function confirmOrder(order: Order) {
    setStatusLoadingId(order.id);
    setActionError(null);
    const result = await patchJson(`/api/orders/${order.id}/status`, {
      status: "CONFIRMED",
    });
    setStatusLoadingId(null);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    router.refresh();
  }

  async function fulfillOrder(order: Order) {
    setStatusLoadingId(order.id);
    setActionError(null);
    const result = await patchJson(`/api/orders/${order.id}/status`, {
      status: "FULFILLED",
    });
    setStatusLoadingId(null);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    router.refresh();
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setActionError(null);
    const result = await postJson(`/api/orders/${cancelTarget.id}/cancel`);
    setCancelling(false);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setCancelTarget(null);
    if (viewOrder?.id === cancelTarget.id) {
      setViewOrder(null);
    }
    router.refresh();
  }

  const columns: ColumnDef<Order, unknown>[] = [
    {
      accessorKey: "id",
      header: "Order",
      cell: ({ getValue }) => (
        <span className="font-mono text-sm text-ink">#{getValue<number>()}</span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer;
        if (!customer) {
          return (
            <span className="font-mono text-xs text-muted">
              User {row.original.userId}
            </span>
          );
        }
        const name = [customer.firstName, customer.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        return (
          <span className="font-medium text-ink">
            {name || customer.email}
          </span>
        );
      },
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => formatEgp(row.original.totalMinor),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original;
        const busy = statusLoadingId === order.id;
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Eye className="size-3.5" />}
              onClick={() => void openOrderDetails(order)}
            >
              View
            </Button>
            {order.status === "PENDING" ? (
              <Button
                type="button"
                size="sm"
                loading={busy}
                leftIcon={<CheckCircle className="size-3.5" />}
                onClick={() => confirmOrder(order)}
              >
                Confirm
              </Button>
            ) : null}
            {order.status === "CONFIRMED" ? (
              <Button
                type="button"
                size="sm"
                loading={busy}
                leftIcon={<Truck className="size-3.5" />}
                onClick={() => fulfillOrder(order)}
              >
                Fulfill
              </Button>
            ) : null}
            {order.status === "PENDING" || order.status === "CONFIRMED" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Ban className="size-3.5" />}
                onClick={() => setCancelTarget(order)}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  const detailOrder = viewOrder;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Review and update order status. New orders cannot be created from admin.
      </p>

      {actionError ? (
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {actionError}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={orders}
        meta={meta ?? undefined}
        error={error}
        buildPageHref={meta ? pageHref : undefined}
        emptyTitle="No orders"
        emptyDescription="Orders appear here when customers checkout."
        toolbar={
          <Suspense fallback={<LoadingState label="Loading filters" compact />}>
            <TableToolbar
              searchKey="userId"
              searchLabel="Customer user ID"
              searchPlaceholder="e.g. 12"
              filters={[
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { value: "ALL", label: "All statuses" },
                    { value: "PENDING", label: "Pending" },
                    { value: "CONFIRMED", label: "Confirmed" },
                    { value: "FULFILLED", label: "Fulfilled" },
                    { value: "CANCELLED", label: "Cancelled" },
                  ],
                },
                {
                  key: "sortOrder",
                  label: "Sort",
                  options: [
                    { value: "desc", label: "Newest first" },
                    { value: "asc", label: "Oldest first" },
                  ],
                },
              ]}
            />
          </Suspense>
        }
      />

      <ManagementDialog
        open={detailOrder !== null}
        onClose={() => {
          setViewOrder(null);
          setViewError(null);
        }}
        mode="view"
        title={detailOrder ? `Order #${detailOrder.id}` : "Order"}
        className="max-w-lg"
      >
        {viewLoading ? <LoadingState label="Loading order" compact /> : null}
        {viewError ? (
          <p role="alert" className="text-sm text-rose-deep">
            {viewError}
          </p>
        ) : null}
        {!viewLoading && detailOrder ? (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              {detailOrder.customer ? (
                <>
                  <div>
                    <dt className="text-muted">Customer ID</dt>
                    <dd className="font-mono text-ink">{detailOrder.customer.id}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Customer name</dt>
                    <dd className="text-ink">
                      {[detailOrder.customer.firstName, detailOrder.customer.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Customer email</dt>
                    <dd className="break-all text-ink">{detailOrder.customer.email}</dd>
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <dt className="text-muted">Customer</dt>
                  <dd className="text-ink">User {detailOrder.userId}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted">Status</dt>
                <dd>
                  <Badge status={detailOrder.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted">Placed</dt>
                <dd className="text-ink">
                  {new Date(detailOrder.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Total</dt>
                <dd className="font-semibold text-ink">
                  {formatEgp(detailOrder.totalMinor)}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="mb-2 font-semibold text-ink">Line items</h3>
              {detailOrder.items.length === 0 ? (
                <p className="text-muted">No line items on this order.</p>
              ) : (
                <ul className="divide-y divide-line rounded-lg border border-line">
                  {detailOrder.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-ink">
                          {item.productNameSnapshot}
                        </p>
                        <p className="text-xs text-muted">
                          SKU {item.productSkuSnapshot} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-ink">{formatEgp(item.lineTotalMinor)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </ManagementDialog>

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => !cancelling && setCancelTarget(null)}
        onConfirm={confirmCancel}
        loading={cancelling}
        danger
        title="Cancel order?"
        description={
          cancelTarget
            ? `Order #${cancelTarget.id} will be marked cancelled.`
            : undefined
        }
        confirmLabel="Cancel order"
      />
    </div>
  );
}
